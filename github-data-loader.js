// 动态加载 GitHub 数据 - 深度分析版 V3.0
// 支持从 GitHub API 直接加载所有案例（分页加载确保稳定）

const CONFIG = {
    githubRepo: 'alandan97/wenchang-data',
    githubApiBase: 'https://api.github.com/repos/alandan97/wenchang-data',
    githubRawBase: 'https://raw.githubusercontent.com/alandan97/wenchang-data/main',
    pageSize: 50,  // 每页加载50个案例，确保稳定
    maxConcurrent: 3  // 最大并发请求数
};

// 缓存机制
let dataCache = {
    cases: null,
    policies: null,
    stats: null,
    caseDetails: {},
    policyDetails: {}
};
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

// 延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 带重试的 fetch
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, { ...options, timeout: 30000 });
            if (response.ok) return response;
            if (response.status === 403) {
                // API 限流，等待后重试
                await delay(1000 * (i + 1));
                continue;
            }
            throw new Error(`HTTP ${response.status}`);
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await delay(500 * (i + 1));
        }
    }
}

// 获取本地 JSON 数据（备用）
async function fetchLocalJson(filename) {
    try {
        const response = await fetch(`./data/${filename}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.warn(`本地数据获取失败: ${filename}`, error);
        return null;
    }
}

// 获取 GitHub 目录内容
async function fetchDirectoryContents(path, page = 1, perPage = 100) {
    const url = `${CONFIG.githubApiBase}/contents/${path}?per_page=${perPage}&page=${page}`;
    const response = await fetchWithRetry(url);
    return await response.json();
}

// 获取单个文件内容
async function fetchFileContent(downloadUrl) {
    const response = await fetchWithRetry(downloadUrl);
    return await response.json();
}

// 获取所有案例文件列表
async function fetchAllCaseFiles() {
    const cacheKey = 'caseFiles';
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
        return JSON.parse(cached);
    }
    
    const files = [];
    let page = 1;
    
    while (true) {
        const contents = await fetchDirectoryContents('cases', page, 100);
        if (!Array.isArray(contents) || contents.length === 0) break;
        
        const caseFiles = contents.filter(f => 
            f.type === 'file' && f.name.includes('deep_analysis')
        );
        files.push(...caseFiles);
        
        if (contents.length < 100) break;
        page++;
        
        // 避免触发 API 限流
        if (page % 5 === 0) await delay(1000);
    }
    
    // 缓存到 sessionStorage
    sessionStorage.setItem(cacheKey, JSON.stringify(files));
    return files;
}

// 批量下载案例（带并发控制）
async function downloadCasesBatch(files, startIndex, batchSize) {
    const batch = files.slice(startIndex, startIndex + batchSize);
    const cases = [];
    
    // 使用 Promise.all 控制并发
    const promises = batch.map(async (file, index) => {
        try {
            await delay(index * 100); // 错开请求时间
            const caseData = await fetchFileContent(file.download_url);
            return caseData;
        } catch (error) {
            console.warn(`下载案例失败: ${file.name}`, error);
            return null;
        }
    });
    
    const results = await Promise.all(promises);
    return results.filter(r => r !== null);
}

// 获取所有案例（分页加载）
async function fetchAllCases(onProgress = null) {
    // 检查缓存
    if (dataCache.cases && Date.now() - dataCache.cases.timestamp < CACHE_DURATION) {
        console.log('使用缓存的案例数据');
        return dataCache.cases.data;
    }
    
    console.log('开始从 GitHub 加载所有案例...');
    
    try {
        // 获取所有案例文件列表
        const files = await fetchAllCaseFiles();
        console.log(`找到 ${files.length} 个案例文件`);
        
        if (onProgress) onProgress({ stage: 'listing', total: files.length, loaded: 0 });
        
        // 分页下载
        const allCases = [];
        const batchSize = CONFIG.pageSize;
        const totalBatches = Math.ceil(files.length / batchSize);
        
        for (let i = 0; i < totalBatches; i++) {
            const startIndex = i * batchSize;
            console.log(`下载第 ${i + 1}/${totalBatches} 批案例...`);
            
            const batchCases = await downloadCasesBatch(files, startIndex, batchSize);
            allCases.push(...batchCases);
            
            if (onProgress) {
                onProgress({ 
                    stage: 'downloading', 
                    total: files.length, 
                    loaded: allCases.length,
                    batch: i + 1,
                    totalBatches
                });
            }
            
            // 批次间延迟，避免触发限流
            if (i < totalBatches - 1) await delay(500);
        }
        
        // 缓存数据
        dataCache.cases = { data: allCases, timestamp: Date.now() };
        
        console.log(`成功加载 ${allCases.length} 个案例`);
        return allCases;
        
    } catch (error) {
        console.error('从 GitHub 加载案例失败:', error);
        // 降级到本地数据
        console.log('尝试加载本地数据...');
        return await fetchLocalJson('cases.json') || [];
    }
}

// 获取案例详情（带缓存）
async function fetchCaseDetail(caseId) {
    // 检查内存缓存
    if (dataCache.caseDetails[caseId]) {
        return dataCache.caseDetails[caseId];
    }
    
    // 检查 localStorage 缓存
    const cached = localStorage.getItem(`case_${caseId}`);
    if (cached) {
        const data = JSON.parse(cached);
        dataCache.caseDetails[caseId] = data;
        return data;
    }
    
    try {
        // 从所有案例中找到对应ID的案例
        const allCases = await fetchAllCases();
        const caseData = allCases.find(c => c.id === caseId);
        
        if (caseData) {
            // 缓存到 localStorage（永久缓存）
            localStorage.setItem(`case_${caseId}`, JSON.stringify(caseData));
            dataCache.caseDetails[caseId] = caseData;
        }
        
        return caseData;
    } catch (error) {
        console.error(`获取案例详情失败: ${caseId}`, error);
        return null;
    }
}

// 获取汇总统计
async function fetchStats() {
    if (dataCache.stats && Date.now() - dataCache.stats.timestamp < CACHE_DURATION) {
        return dataCache.stats.data;
    }
    
    try {
        // 优先从 GitHub 获取
        const response = await fetchWithRetry(`${CONFIG.githubRawBase}/stats/progress.json`);
        const data = await response.json();
        dataCache.stats = { data, timestamp: Date.now() };
        return data;
    } catch (error) {
        console.warn('从 GitHub 获取统计失败，使用本地数据');
        return await fetchLocalJson('summary.json') || { 
            total_cases: 968, 
            total_policies: 277, 
            total_brands: 156,
            data_version: '3.0' 
        };
    }
}

// 获取政策列表
async function fetchPolicies() {
    if (dataCache.policies && Date.now() - dataCache.policies.timestamp < CACHE_DURATION) {
        return dataCache.policies.data;
    }
    
    try {
        // 从本地获取政策数据（政策数量较少）
        const policies = await fetchLocalJson('policies.json') || [];
        dataCache.policies = { data: policies, timestamp: Date.now() };
        return policies;
    } catch (error) {
        console.error('获取政策失败:', error);
        return [];
    }
}

// 获取统计信息
async function getStats() {
    const stats = await fetchStats();
    return {
        totalCases: stats.total_cases || 0,
        totalPolicies: stats.total_policies || 0,
        totalBrands: stats.total_brands || 0,
        progressPercent: Math.round((stats.total_cases || 0) / 1000 * 100),
        dataVersion: stats.data_version || '3.0'
    };
}

// 更新统计显示
async function updateStatsDisplay() {
    try {
        const stats = await getStats();
        
        const elements = {
            'stat-case-count': stats.totalCases.toLocaleString(),
            'stat-policy-count': stats.totalPolicies.toLocaleString(),
            'stat-brand-count': stats.totalBrands.toLocaleString(),
            'stat-province-count': '34',
            'data-version': `V${stats.dataVersion}`
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) {
                el.textContent = value;
                el.style.opacity = '1';
            }
        });
        
        console.log('统计数据已更新:', stats);
    } catch (error) {
        console.error('更新统计显示失败:', error);
    }
}

// 渲染案例卡片（简化版）
function renderCaseCard(caseData) {
    const { id, name, brand, category, location = {}, product_info = {}, kpi_data = {} } = caseData;
    const province = location.province || '未知';
    const city = location.city || '';
    const description = product_info.design_concept?.substring(0, 80) + '...' || '';
    const highlights = product_info.core_selling_points?.slice(0, 3) || [];
    
    return `
        <div class="case-card" data-id="${id}" onclick="showCaseDetail('${id}')">
            <div class="case-header">
                <h3 class="case-title">${name}</h3>
                <span class="case-brand">${brand}</span>
            </div>
            <div class="case-body">
                <p class="case-description">${description}</p>
                ${highlights.length > 0 ? `
                    <div class="case-highlights">
                        ${highlights.map(h => `<span class="highlight-tag">${h}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
            <div class="case-footer">
                <span class="case-location">📍 ${city || province}</span>
                <span class="case-category">${category}</span>
            </div>
        </div>
    `;
}

// 渲染政策卡片
function renderPolicyCard(policy) {
    const { id, title, level, region, category, tags = [], metadata = {} } = policy;
    
    const levelText = { 'national': '国家级', 'provincial': '省级', 'city': '市级' }[level] || level;
    
    return `
        <div class="policy-card" data-id="${id}">
            <div class="policy-header">
                <h3 class="policy-title">${title}</h3>
                <span class="policy-level ${level}">${levelText}</span>
            </div>
            <div class="policy-body">
                <div class="policy-tags">
                    ${tags.slice(0, 5).map(tag => `<span class="policy-tag">${tag}</span>`).join('')}
                </div>
                <p class="policy-category">分类: ${category}</p>
            </div>
            <div class="policy-footer">
                <span class="policy-region">📍 ${region}</span>
                <span class="policy-date">📅 ${metadata.issue_date || ''}</span>
            </div>
        </div>
    `;
}

// 渲染案例列表（支持分页）
async function renderCases(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`容器 #${containerId} 不存在`);
        return;
    }
    
    // 显示加载进度
    container.innerHTML = `
        <div class="loading-progress" style="text-align:center;padding:2rem;">
            <div style="color:#8B1E1E;font-size:1.2rem;margin-bottom:1rem;">正在加载案例数据...</div>
            <div class="progress-bar" style="width:200px;height:8px;background:#F5F0E6;border-radius:4px;margin:0 auto;overflow:hidden;">
                <div class="progress-fill" style="width:0%;height:100%;background:#C89B3C;transition:width 0.3s;"></div>
            </div>
            <div class="progress-text" style="color:#6B5B4F;margin-top:0.5rem;font-size:0.9rem;">准备中...</div>
        </div>
    `;
    
    const progressFill = container.querySelector('.progress-fill');
    const progressText = container.querySelector('.progress-text');
    
    try {
        // 加载所有案例（带进度回调）
        const cases = await fetchAllCases((progress) => {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            if (progressFill) progressFill.style.width = `${percent}%`;
            if (progressText) {
                progressText.textContent = progress.stage === 'listing' 
                    ? `发现 ${progress.total} 个案例...`
                    : `已加载 ${progress.loaded}/${progress.total} 个案例`;
            }
        });
        
        // 过滤
        let filtered = cases;
        if (options.category) {
            filtered = filtered.filter(c => c.category === options.category);
        }
        if (options.province) {
            filtered = filtered.filter(c => 
                c.location?.province === options.province
            );
        }
        if (options.search) {
            const searchLower = options.search.toLowerCase();
            filtered = filtered.filter(c => 
                c.name?.toLowerCase().includes(searchLower) ||
                c.brand?.toLowerCase().includes(searchLower)
            );
        }
        
        if (filtered.length === 0) {
            container.innerHTML = '<div class="empty" style="text-align:center;padding:2rem;color:#6B5B4F;">暂无案例</div>';
            return;
        }
        
        // 分页显示
        const pageSize = options.pageSize || 20;
        const currentPage = options.page || 1;
        const start = (currentPage - 1) * pageSize;
        const paginatedCases = filtered.slice(start, start + pageSize);
        
        // 渲染
        container.innerHTML = paginatedCases.map(renderCaseCard).join('');
        
        // 添加分页控件
        const totalPages = Math.ceil(filtered.length / pageSize);
        if (totalPages > 1) {
            renderPagination(container, currentPage, totalPages, filtered.length, options);
        }
        
        console.log(`渲染完成: ${paginatedCases.length}/${filtered.length} 个案例`);
        
    } catch (error) {
        console.error('渲染案例失败:', error);
        container.innerHTML = '<div class="error" style="text-align:center;padding:2rem;color:#E74C3C;">加载失败，请刷新重试</div>';
    }
}

// 渲染分页控件
function renderPagination(container, currentPage, totalPages, totalItems, options) {
    const pagination = document.createElement('div');
    pagination.className = 'pagination';
    pagination.style.cssText = 'display:flex;justify-content:center;align-items:center;gap:0.5rem;margin-top:2rem;padding:1rem;';
    
    // 上一页
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '← 上一页';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => renderCases(container.id, { ...options, page: currentPage - 1 });
    pagination.appendChild(prevBtn);
    
    // 页码信息
    const info = document.createElement('span');
    info.textContent = `第 ${currentPage}/${totalPages} 页 (共 ${totalItems} 个)`;
    info.style.cssText = 'color:#6B5B4F;padding:0 1rem;';
    pagination.appendChild(info);
    
    // 下一页
    const nextBtn = document.createElement('button');
    nextBtn.textContent = '下一页 →';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => renderCases(container.id, { ...options, page: currentPage + 1 });
    pagination.appendChild(nextBtn);
    
    container.parentNode.insertBefore(pagination, container.nextSibling);
}

// 渲染政策列表
async function renderPolicies(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '<div class="loading" style="text-align:center;padding:2rem;color:#6B5B4F;">加载中...</div>';
    
    try {
        const policies = await fetchPolicies();
        
        let filtered = policies;
        if (options.level) filtered = filtered.filter(p => p.level === options.level);
        if (options.category) filtered = filtered.filter(p => p.category === options.category);
        if (options.limit) filtered = filtered.slice(0, options.limit);
        
        container.innerHTML = filtered.length > 0 
            ? filtered.map(renderPolicyCard).join('')
            : '<div class="empty" style="text-align:center;padding:2rem;color:#6B5B4F;">暂无政策</div>';
            
    } catch (error) {
        console.error('渲染政策失败:', error);
        container.innerHTML = '<div class="error" style="text-align:center;padding:2rem;color:#E74C3C;">加载失败</div>';
    }
}

// 显示案例详情
async function showCaseDetail(caseId) {
    console.log('查看案例详情:', caseId);
    
    // 预加载案例详情到缓存
    const caseData = await fetchCaseDetail(caseId);
    if (caseData) {
        console.log('案例详情已缓存:', caseData.name);
    }
    
    window.location.href = `case-detail.html?id=${caseId}`;
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('数据加载器 V3.0 已初始化 - 支持从 GitHub 加载所有案例');
    
    // 更新统计数字
    updateStatsDisplay();
    
    // 自动渲染案例容器
    const caseContainers = document.querySelectorAll('[data-cases-container]');
    caseContainers.forEach(container => {
        const options = {
            category: container.dataset.category,
            province: container.dataset.province,
            search: container.dataset.search,
            pageSize: parseInt(container.dataset.pageSize) || 20,
            page: parseInt(container.dataset.page) || 1
        };
        renderCases(container.id, options);
    });
    
    // 自动渲染政策容器
    const policyContainers = document.querySelectorAll('[data-policies-container]');
    policyContainers.forEach(container => {
        const options = {
            level: container.dataset.level,
            category: container.dataset.category,
            limit: parseInt(container.dataset.limit) || undefined
        };
        renderPolicies(container.id, options);
    });
});

// 导出 API
window.WenChangData = {
    fetchStats,
    fetchAllCases,
    fetchCaseDetail,
    fetchPolicies,
    getStats,
    updateStatsDisplay,
    renderCases,
    renderPolicies,
    renderCaseCard,
    renderPolicyCard,
    showCaseDetail,
    CONFIG
};
