// 文创指南数据加载器 V4.0
// 从 GitHub 加载所有案例和政策数据

const CONFIG = {
    githubRepo: 'alandan97/wenchang-data',
    githubApiBase: 'https://api.github.com/repos/alandan97/wenchang-data',
    githubRawBase: 'https://raw.githubusercontent.com/alandan97/wenchang-data/main',
    pageSize: 100,
    maxConcurrent: 5
};

// 缓存
let dataCache = {
    cases: null,
    policies: null,
    stats: null,
    timestamp: 0
};
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟

// 延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 带重试的 fetch
async function fetchWithRetry(url, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url);
            if (response.ok) return response;
            if (response.status === 403) {
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

// 获取本地 JSON
async function fetchLocalJson(filename) {
    try {
        const response = await fetch(`./data/${filename}`);
        if (!response.ok) return null;
        return await response.json();
    } catch {
        return null;
    }
}

// 获取 GitHub 目录内容
async function fetchDirectoryContents(path, page = 1, perPage = 100) {
    const url = `${CONFIG.githubApiBase}/contents/${path}?per_page=${perPage}&page=${page}`;
    const response = await fetchWithRetry(url);
    return await response.json();
}

// 获取单个文件
async function fetchFileContent(downloadUrl) {
    const response = await fetchWithRetry(downloadUrl);
    return await response.json();
}

// 获取所有案例文件列表
async function fetchAllCaseFiles() {
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
    
    return files;
}

// 批量下载案例
async function downloadCasesBatch(files, startIndex, batchSize) {
    const batch = files.slice(startIndex, startIndex + batchSize);
    const cases = [];
    
    for (let i = 0; i < batch.length; i++) {
        try {
            await delay(i * 50); // 错开请求
            const caseData = await fetchFileContent(batch[i].download_url);
            cases.push(caseData);
        } catch (error) {
            console.warn(`下载案例失败: ${batch[i].name}`, error);
        }
    }
    
    return cases;
}

// 获取所有案例
async function fetchAllCases(onProgress = null) {
    // 检查缓存
    if (dataCache.cases && Date.now() - dataCache.timestamp < CACHE_DURATION) {
        console.log('使用缓存的案例数据');
        return dataCache.cases;
    }
    
    console.log('开始从 GitHub 加载所有案例...');
    
    try {
        const files = await fetchAllCaseFiles();
        console.log(`找到 ${files.length} 个案例文件`);
        
        if (onProgress) onProgress({ stage: 'listing', total: files.length, loaded: 0 });
        
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
            
            if (i < totalBatches - 1) await delay(300);
        }
        
        // 缓存数据
        dataCache.cases = allCases;
        dataCache.timestamp = Date.now();
        
        console.log(`成功加载 ${allCases.length} 个案例`);
        return allCases;
        
    } catch (error) {
        console.error('从 GitHub 加载案例失败:', error);
        // 降级到本地数据
        const localCases = await fetchLocalJson('cases.json') || [];
        console.log(`使用本地数据: ${localCases.length} 个案例`);
        return localCases;
    }
}

// 获取所有政策文件
async function fetchAllPolicyFiles() {
    const allFiles = [];
    
    // 国家级政策
    console.log('获取国家级政策...');
    let page = 1;
    while (true) {
        const files = await fetchDirectoryContents('policies/national', page, 100);
        if (!Array.isArray(files) || files.length === 0) break;
        allFiles.push(...files.filter(f => f.type === 'file'));
        if (files.length < 100) break;
        page++;
    }
    console.log(`  国家级: ${allFiles.length} 个`);
    
    // 省级政策
    console.log('获取省级政策...');
    const provincialDirs = await fetchDirectoryContents('policies/provincial');
    if (Array.isArray(provincialDirs)) {
        for (const d of provincialDirs) {
            if (d.type === 'dir') {
                const files = await fetchDirectoryContents(`policies/provincial/${d.name}`, 1, 100);
                if (Array.isArray(files)) {
                    allFiles.push(...files.filter(f => f.type === 'file'));
                }
            }
        }
    }
    
    // 市级政策
    console.log('获取市级政策...');
    const cityDirs = await fetchDirectoryContents('policies/city');
    if (Array.isArray(cityDirs)) {
        for (const d of cityDirs) {
            if (d.type === 'dir') {
                const files = await fetchDirectoryContents(`policies/city/${d.name}`, 1, 100);
                if (Array.isArray(files)) {
                    allFiles.push(...files.filter(f => f.type === 'file'));
                }
            }
        }
    }
    
    console.log(`政策文件总计: ${allFiles.length} 个`);
    return allFiles;
}

// 获取所有政策
async function fetchAllPolicies(onProgress = null) {
    // 检查缓存
    if (dataCache.policies && Date.now() - dataCache.timestamp < CACHE_DURATION) {
        console.log('使用缓存的政策数据');
        return dataCache.policies;
    }
    
    console.log('开始从 GitHub 加载所有政策...');
    
    try {
        const files = await fetchAllPolicyFiles();
        
        if (onProgress) onProgress({ stage: 'listing', total: files.length, loaded: 0 });
        
        const allPolicies = [];
        const batchSize = 50;
        const totalBatches = Math.ceil(files.length / batchSize);
        
        for (let i = 0; i < totalBatches; i++) {
            const startIndex = i * batchSize;
            console.log(`下载第 ${i + 1}/${totalBatches} 批政策...`);
            
            const batch = files.slice(startIndex, startIndex + batchSize);
            for (let j = 0; j < batch.length; j++) {
                try {
                    await delay(j * 30);
                    const policyData = await fetchFileContent(batch[j].download_url);
                    allPolicies.push(policyData);
                } catch (error) {
                    console.warn(`下载政策失败: ${batch[j].name}`, error);
                }
            }
            
            if (onProgress) {
                onProgress({ 
                    stage: 'downloading', 
                    total: files.length, 
                    loaded: allPolicies.length,
                    batch: i + 1,
                    totalBatches
                });
            }
            
            if (i < totalBatches - 1) await delay(200);
        }
        
        // 缓存数据
        dataCache.policies = allPolicies;
        dataCache.timestamp = Date.now();
        
        console.log(`成功加载 ${allPolicies.length} 个政策`);
        return allPolicies;
        
    } catch (error) {
        console.error('从 GitHub 加载政策失败:', error);
        // 降级到本地数据
        const localPolicies = await fetchLocalJson('policies.json') || [];
        console.log(`使用本地数据: ${localPolicies.length} 个政策`);
        return localPolicies;
    }
}

// 获取统计数据
async function fetchStats() {
    if (dataCache.stats && Date.now() - dataCache.timestamp < CACHE_DURATION) {
        return dataCache.stats;
    }
    
    try {
        const response = await fetchWithRetry(`${CONFIG.githubRawBase}/stats/progress.json`);
        const data = await response.json();
        dataCache.stats = data;
        return data;
    } catch (error) {
        console.warn('从 GitHub 获取统计失败，使用本地数据');
        return await fetchLocalJson('summary.json') || { 
            total_cases: 1000, 
            total_policies: 517, 
            total_brands: 156,
            data_version: '4.0' 
        };
    }
}

// 格式化数字
function formatNumber(num) {
    if (num >= 100000000) {
        return (num / 100000000).toFixed(1) + '亿';
    } else if (num >= 10000) {
        return (num / 10000).toFixed(0) + '万';
    } else {
        return num.toLocaleString();
    }
}

// 渲染案例卡片
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
    const levelClass = level || 'national';
    
    return `
        <div class="policy-card" data-id="${id}">
            <div class="policy-header">
                <h3 class="policy-title">${title}</h3>
                <span class="policy-level ${levelClass}">${levelText}</span>
            </div>
            <div class="policy-body">
                <div class="policy-tags">
                    ${(tags || []).slice(0, 5).map(tag => `<span class="policy-tag">${tag}</span>`).join('')}
                </div>
                <p class="policy-category">分类: ${category}</p>
            </div>
            <div class="policy-footer">
                <span class="policy-region">📍 ${region}</span>
                <span class="policy-date">📅 ${metadata?.issue_date || ''}</span>
            </div>
        </div>
    `;
}

// 渲染案例列表
async function renderCases(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`容器 #${containerId} 不存在`);
        return;
    }
    
    container.innerHTML = '<div class="loading" style="text-align:center;padding:2rem;color:#6B5B4F;">加载中...</div>';
    
    try {
        const cases = await fetchAllCases();
        
        // 过滤
        let filtered = cases;
        if (options.category) {
            filtered = filtered.filter(c => c.category === options.category);
        }
        if (options.province) {
            filtered = filtered.filter(c => c.location?.province === options.province);
        }
        if (options.limit) {
            filtered = filtered.slice(0, options.limit);
        }
        
        if (filtered.length === 0) {
            container.innerHTML = '<div class="empty" style="text-align:center;padding:2rem;color:#6B5B4F;">暂无案例</div>';
            return;
        }
        
        container.innerHTML = filtered.map(renderCaseCard).join('');
        console.log(`渲染完成: ${filtered.length} 个案例`);
        
    } catch (error) {
        console.error('渲染案例失败:', error);
        container.innerHTML = '<div class="error" style="text-align:center;padding:2rem;color:#E74C3C;">加载失败，请刷新重试</div>';
    }
}

// 渲染政策列表
async function renderPolicies(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`容器 #${containerId} 不存在`);
        return;
    }
    
    container.innerHTML = '<div class="loading" style="text-align:center;padding:2rem;color:#6B5B4F;">加载中...</div>';
    
    try {
        const policies = await fetchAllPolicies();
        
        // 过滤
        let filtered = policies;
        if (options.level) {
            filtered = filtered.filter(p => p.level === options.level);
        }
        if (options.category) {
            filtered = filtered.filter(p => p.category === options.category);
        }
        if (options.limit) {
            filtered = filtered.slice(0, options.limit);
        }
        
        if (filtered.length === 0) {
            container.innerHTML = '<div class="empty" style="text-align:center;padding:2rem;color:#6B5B4F;">暂无政策</div>';
            return;
        }
        
        container.innerHTML = filtered.map(renderPolicyCard).join('');
        console.log(`渲染完成: ${filtered.length} 个政策`);
        
    } catch (error) {
        console.error('渲染政策失败:', error);
        container.innerHTML = '<div class="error" style="text-align:center;padding:2rem;color:#E74C3C;">加载失败</div>';
    }
}

// 显示案例详情
function showCaseDetail(caseId) {
    console.log('查看案例详情:', caseId);
    window.location.href = `case-detail.html?id=${caseId}`;
}

// 更新统计显示
async function updateStatsDisplay() {
    try {
        const stats = await fetchStats();
        
        const elements = {
            'stat-case-count': (stats.total_cases || 0).toLocaleString(),
            'stat-policy-count': (stats.total_policies || 0).toLocaleString(),
            'stat-brand-count': (stats.total_brands || 0).toLocaleString(),
            'stat-province-count': '34',
            'data-version': `V${stats.data_version || '4.0'}`
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

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('数据加载器 V4.0 已初始化');
    
    // 更新统计数字
    updateStatsDisplay();
    
    // 自动渲染案例容器
    const caseContainers = document.querySelectorAll('[data-cases-container]');
    caseContainers.forEach(container => {
        const options = {
            category: container.dataset.category,
            province: container.dataset.province,
            limit: parseInt(container.dataset.limit) || undefined
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
    fetchAllPolicies,
    updateStatsDisplay,
    renderCases,
    renderPolicies,
    renderCaseCard,
    renderPolicyCard,
    showCaseDetail,
    formatNumber,
    CONFIG
};
