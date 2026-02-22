// 动态加载 GitHub 数据
// 从 wenchang-data 仓库获取案例数据并渲染

const CONFIG = {
    owner: 'alandan97',
    repo: 'wenchang-data',
    branch: 'main',
    casesPath: 'cases',
    policiesPath: 'policies',
    // GitHub API 有速率限制，使用 raw.githubusercontent.com 直接获取文件内容
    rawBaseUrl: 'https://raw.githubusercontent.com/alandan97/wenchang-data/main',
    apiBaseUrl: 'https://api.github.com/repos/alandan97/wenchang-data'
};

// 缓存机制
const DataCache = {
    cases: null,
    policies: null,
    lastFetch: null,
    CACHE_DURATION: 5 * 60 * 1000, // 5分钟缓存
    
    isValid() {
        return this.lastFetch && (Date.now() - this.lastFetch < this.CACHE_DURATION);
    },
    
    set(cases, policies) {
        this.cases = cases;
        this.policies = policies;
        this.lastFetch = Date.now();
    },
    
    get() {
        if (this.isValid()) {
            return { cases: this.cases, policies: this.policies };
        }
        return null;
    }
};

// 获取目录内容列表
async function fetchDirectoryContents(path) {
    try {
        const response = await fetch(`${CONFIG.apiBaseUrl}/contents/${path}?ref=${CONFIG.branch}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`获取 ${path} 目录失败:`, error);
        return [];
    }
}

// 获取单个文件内容
async function fetchFileContent(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('获取文件内容失败:', error);
        return null;
    }
}

// 获取所有案例数据
async function fetchAllCases() {
    const cache = DataCache.get();
    if (cache && cache.cases) {
        console.log('使用缓存的案例数据');
        return cache.cases;
    }
    
    console.log('从 GitHub 获取案例数据...');
    const files = await fetchDirectoryContents(CONFIG.casesPath);
    
    // 只获取 case_ 开头的文件（brand_ 文件是品牌列表）
    const caseFiles = files.filter(f => f.name.startsWith('case_') && f.type === 'file');
    
    // 并行获取所有案例内容（限制并发数避免请求过多）
    const batchSize = 10;
    const cases = [];
    
    for (let i = 0; i < caseFiles.length; i += batchSize) {
        const batch = caseFiles.slice(i, i + batchSize);
        const batchResults = await Promise.all(
            batch.map(file => fetchFileContent(file.download_url))
        );
        cases.push(...batchResults.filter(c => c !== null));
    }
    
    console.log(`成功加载 ${cases.length} 个案例`);
    return cases;
}

// 获取所有政策数据
async function fetchAllPolicies() {
    const cache = DataCache.get();
    if (cache && cache.policies) {
        return cache.policies;
    }
    
    console.log('从 GitHub 获取政策数据...');
    const policyFiles = [];
    
    // 获取国家级政策
    const nationalFiles = await fetchDirectoryContents(`${CONFIG.policiesPath}/national`);
    policyFiles.push(...nationalFiles.filter(f => f.type === 'file'));
    
    // 获取省级政策
    const provincialPath = `${CONFIG.policiesPath}/provincial`;
    const provincialDirs = await fetchDirectoryContents(provincialPath);
    for (const dir of provincialDirs.filter(d => d.type === 'dir')) {
        const files = await fetchDirectoryContents(`${provincialPath}/${dir.name}`);
        policyFiles.push(...files.filter(f => f.type === 'file'));
    }
    
    // 获取市级政策
    const cityPath = `${CONFIG.policiesPath}/city`;
    const cityDirs = await fetchDirectoryContents(cityPath);
    for (const dir of cityDirs.filter(d => d.type === 'dir')) {
        const files = await fetchDirectoryContents(`${cityPath}/${dir.name}`);
        policyFiles.push(...files.filter(f => f.type === 'file'));
    }
    
    // 并行获取所有政策内容
    const batchSize = 10;
    const policies = [];
    
    for (let i = 0; i < policyFiles.length; i += batchSize) {
        const batch = policyFiles.slice(i, i + batchSize);
        const batchResults = await Promise.all(
            batch.map(file => fetchFileContent(file.download_url))
        );
        policies.push(...batchResults.filter(p => p !== null));
    }
    
    console.log(`成功加载 ${policies.length} 条政策`);
    return policies;
}

// 加载所有数据
async function loadAllData() {
    const cache = DataCache.get();
    if (cache) {
        return cache;
    }
    
    const [cases, policies] = await Promise.all([
        fetchAllCases(),
        fetchAllPolicies()
    ]);
    
    DataCache.set(cases, policies);
    return { cases, policies };
}

// 渲染案例卡片
function renderCaseCard(caseData) {
    const { id, name, brand, category, location, description, highlights = [] } = caseData;
    
    return `
        <div class="case-card" data-id="${id}" data-category="${category}" data-location="${location?.province || ''}">
            <div class="case-header">
                <h3 class="case-title">${name}</h3>
                <span class="case-brand">${brand}</span>
            </div>
            <div class="case-body">
                <p class="case-description">${description?.substring(0, 100) || ''}...</p>
                ${highlights.length > 0 ? `
                    <div class="case-highlights">
                        ${highlights.map(h => `<span class="highlight-tag">${h}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
            <div class="case-footer">
                <span class="case-location">📍 ${location?.city || location?.province || '未知'}</span>
                <span class="case-category">${category}</span>
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
    
    // 显示加载状态
    container.innerHTML = '<div class="loading">加载中...</div>';
    
    try {
        const { cases } = await loadAllData();
        
        // 过滤和排序
        let filteredCases = cases;
        if (options.category) {
            filteredCases = filteredCases.filter(c => c.category === options.category);
        }
        if (options.province) {
            filteredCases = filteredCases.filter(c => c.location?.province === options.province);
        }
        if (options.limit) {
            filteredCases = filteredCases.slice(0, options.limit);
        }
        
        if (filteredCases.length === 0) {
            container.innerHTML = '<div class="empty">暂无案例</div>';
            return;
        }
        
        // 渲染案例
        container.innerHTML = filteredCases.map(renderCaseCard).join('');
        
        // 添加点击事件
        container.querySelectorAll('.case-card').forEach(card => {
            card.addEventListener('click', () => {
                const caseId = card.dataset.id;
                showCaseDetail(caseId);
            });
        });
        
    } catch (error) {
        console.error('渲染案例失败:', error);
        container.innerHTML = '<div class="error">加载失败，请稍后重试</div>';
    }
}

// 显示案例详情（可扩展为弹窗或跳转）
function showCaseDetail(caseId) {
    console.log('查看案例详情:', caseId);
    // 可以在这里实现弹窗或页面跳转
    // window.location.href = `/case-detail.html?id=${caseId}`;
}

// 获取统计数据
async function getStats() {
    const { cases, policies } = await loadAllData();
    
    // 统计各省份案例数
    const provinceStats = {};
    cases.forEach(c => {
        const province = c.location?.province || '未知';
        provinceStats[province] = (provinceStats[province] || 0) + 1;
    });
    
    // 统计各类别案例数
    const categoryStats = {};
    cases.forEach(c => {
        const category = c.category || '其他';
        categoryStats[category] = (categoryStats[category] || 0) + 1;
    });
    
    return {
        totalCases: cases.length,
        totalPolicies: policies.length,
        provinceStats,
        categoryStats
    };
}

// 更新统计显示
async function updateStatsDisplay() {
    const stats = await getStats();
    
    // 更新页面上的统计数字
    const caseCountEl = document.getElementById('case-count');
    const policyCountEl = document.getElementById('policy-count');
    
    if (caseCountEl) caseCountEl.textContent = stats.totalCases;
    if (policyCountEl) policyCountEl.textContent = stats.totalPolicies;
    
    console.log('统计数据:', stats);
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('动态数据加载器已初始化');
    
    // 如果页面有案例容器，自动加载
    const caseContainers = document.querySelectorAll('[data-cases-container]');
    caseContainers.forEach(container => {
        const options = {
            category: container.dataset.category,
            province: container.dataset.province,
            limit: parseInt(container.dataset.limit) || undefined
        };
        renderCases(container.id, options);
    });
    
    // 更新统计
    updateStatsDisplay();
});

// 导出 API
window.WenChangData = {
    loadAllData,
    fetchAllCases,
    fetchAllPolicies,
    renderCases,
    getStats,
    updateStatsDisplay,
    CONFIG
};
