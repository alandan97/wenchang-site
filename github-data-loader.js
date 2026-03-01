// 文创指南数据加载器 V5.1 - 修复版
// 增强错误处理，统一数据路径，移除硬编码

const CONFIG = {
    dataPath: './data',
    fallbackData: {
        total_cases: 125,
        total_policies: 1085,
        total_brands: 50,
        data_version: '5.1'
    }
};

// 缓存
let dataCache = {
    cases: null,
    policies: null,
    stats: null,
    lastFetch: {}
};

// 缓存有效期（毫秒）
const CACHE_TTL = 5 * 60 * 1000; // 5分钟

// 格式化数字
function formatNumber(num) {
    if (num === undefined || num === null) return 'N/A';
    const n = parseFloat(num);
    if (isNaN(n)) return num;
    if (n >= 100000000) {
        return (n / 100000000).toFixed(1) + '亿';
    } else if (n >= 10000) {
        return (n / 10000).toFixed(0) + '万';
    } else {
        return n.toLocaleString();
    }
}

// 检查缓存是否有效
function isCacheValid(key) {
    const lastFetch = dataCache.lastFetch[key];
    if (!lastFetch) return false;
    return (Date.now() - lastFetch) < CACHE_TTL;
}

// 获取本地 JSON 数据（增强错误处理）
async function fetchLocalJson(filename, options = {}) {
    const { useCache = true, silent = false } = options;
    
    // 检查缓存
    if (useCache && dataCache[filename] && isCacheValid(filename)) {
        console.log(`[缓存] 使用缓存的 ${filename}`);
        return dataCache[filename];
    }
    
    try {
        const response = await fetch(`${CONFIG.dataPath}/${filename}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });
        
        if (!response.ok) {
            if (!silent) {
                console.warn(`⚠️ 获取 ${filename} 失败: HTTP ${response.status}`);
            }
            return null;
        }
        
        const data = await response.json();
        
        // 更新缓存
        if (useCache) {
            dataCache[filename] = data;
            dataCache.lastFetch[filename] = Date.now();
        }
        
        return data;
    } catch (error) {
        if (!silent) {
            console.error(`❌ 获取 ${filename} 出错:`, error.message);
        }
        return null;
    }
}

// 批量获取多个 JSON 文件
async function fetchMultipleJson(filenames) {
    const results = await Promise.all(
        filenames.map(name => fetchLocalJson(name, { silent: true }))
    );
    return filenames.reduce((acc, name, index) => {
        acc[name] = results[index];
        return acc;
    }, {});
}

// 获取所有案例（增强版）
async function fetchAllCases(options = {}) {
    const { forceRefresh = false, useFallback = true } = options;
    
    if (!forceRefresh && dataCache.cases && isCacheValid('cases')) {
        console.log(`[缓存] 返回 ${dataCache.cases.length} 个案例`);
        return dataCache.cases;
    }
    
    // 尝试多个数据源
    const sources = ['cases_summary.json', 'cases.json', 'index.json'];
    let cases = null;
    
    for (const source of sources) {
        const data = await fetchLocalJson(source, { silent: true });
        if (data) {
            // 处理不同格式的数据
            if (Array.isArray(data)) {
                cases = data;
            } else if (data.cases && Array.isArray(data.cases)) {
                cases = data.cases;
            } else if (data.case_categories) {
                // 从索引构建案例列表
                cases = Object.values(data.case_categories).flat();
            }
            
            if (cases && cases.length > 0) {
                console.log(`✅ 从 ${source} 加载了 ${cases.length} 个案例`);
                break;
            }
        }
    }
    
    // 使用降级数据
    if (!cases || cases.length === 0) {
        if (useFallback && typeof STATIC_DATA !== 'undefined') {
            cases = STATIC_DATA.cases || [];
            console.log(`⚠️ 使用静态降级数据: ${cases.length} 个案例`);
        } else {
            cases = [];
            console.warn('❌ 无法加载案例数据');
        }
    }
    
    dataCache.cases = cases;
    dataCache.lastFetch['cases'] = Date.now();
    return cases;
}

// 获取所有政策（增强版）
async function fetchAllPolicies(options = {}) {
    const { forceRefresh = false, useFallback = true } = options;
    
    if (!forceRefresh && dataCache.policies && isCacheValid('policies')) {
        console.log(`[缓存] 返回 ${dataCache.policies.length} 个政策`);
        return dataCache.policies;
    }
    
    // 尝试多个数据源
    const sources = ['policies_summary.json', 'policies.json'];
    let policies = null;
    
    for (const source of sources) {
        const data = await fetchLocalJson(source, { silent: true });
        if (data && Array.isArray(data) && data.length > 0) {
            policies = data;
            console.log(`✅ 从 ${source} 加载了 ${policies.length} 个政策`);
            break;
        }
    }
    
    if (!policies || policies.length === 0) {
        policies = [];
        console.warn('❌ 无法加载政策数据');
    }
    
    dataCache.policies = policies;
    dataCache.lastFetch['policies'] = Date.now();
    return policies;
}

// 获取统计数据（增强版）
async function fetchStats(options = {}) {
    const { forceRefresh = false } = options;
    
    if (!forceRefresh && dataCache.stats && isCacheValid('stats')) {
        return dataCache.stats;
    }
    
    // 尝试多个数据源
    const sources = ['stats.json', 'summary.json', 'index.json'];
    let stats = null;
    
    for (const source of sources) {
        const data = await fetchLocalJson(source, { silent: true });
        if (data) {
            // 处理不同格式的数据
            if (data.total_cases !== undefined) {
                stats = data;
            } else if (data.total_cases !== undefined) {
                stats = {
                    total_cases: data.total_cases,
                    total_policies: data.total_policies,
                    total_brands: data.total_brands || 50,
                    data_version: data.data_version || '5.1'
                };
            }
            
            if (stats) {
                console.log(`✅ 从 ${source} 加载统计数据`);
                break;
            }
        }
    }
    
    // 使用降级数据
    if (!stats) {
        stats = { ...CONFIG.fallbackData };
        console.log('⚠️ 使用默认统计数据');
    }
    
    dataCache.stats = stats;
    dataCache.lastFetch['stats'] = Date.now();
    return stats;
}

// 清除缓存
function clearCache(key) {
    if (key) {
        dataCache[key] = null;
        dataCache.lastFetch[key] = null;
        console.log(`[缓存] 已清除 ${key}`);
    } else {
        dataCache.cases = null;
        dataCache.policies = null;
        dataCache.stats = null;
        dataCache.lastFetch = {};
        console.log('[缓存] 已清除全部');
    }
}

// 渲染案例卡片（增强版）
function renderCaseCard(caseData) {
    if (!caseData || typeof caseData !== 'object') {
        console.warn('无效的 caseData:', caseData);
        return '';
    }
    
    const { 
        id, 
        name = '未命名', 
        brand = '', 
        category = '其他', 
        province = '', 
        city = '', 
        description = '', 
        highlights = [], 
        kpi = {} 
    } = caseData;
    
    const location = city || province || '未知';
    const desc = description || '';
    const highlightsHtml = Array.isArray(highlights) 
        ? highlights.slice(0, 3).map(h => `<span class="highlight-tag">${h}</span>`).join('')
        : '';
    
    // 安全的 ID 处理
    const safeId = encodeURIComponent(id || '');
    
    return `
        <div class="case-card" data-id="${safeId}" onclick="showCaseDetail('${safeId}')">
            <div class="case-header">
                <h3 class="case-title">${escapeHtml(name)}</h3>
                ${brand ? `<span class="case-brand">${escapeHtml(brand)}</span>` : ''}
            </div>
            <div class="case-body">
                <p class="case-description">${escapeHtml(desc)}</p>
                ${highlightsHtml ? `<div class="case-highlights">${highlightsHtml}</div>` : ''}
                <div class="case-stats-mini">
                    <span>📊 销量: ${kpi.sales_volume || 'N/A'}</span>
                    <span>💰 营收: ${kpi.revenue || 'N/A'}</span>
                </div>
            </div>
            <div class="case-footer">
                <span class="case-location">📍 ${escapeHtml(location)}</span>
                <span class="case-category">${escapeHtml(category)}</span>
            </div>
        </div>
    `;
}

// 渲染政策卡片（增强版）
function renderPolicyCard(policy) {
    if (!policy || typeof policy !== 'object') {
        console.warn('无效的 policy:', policy);
        return '';
    }
    
    const { 
        id, 
        title = '未命名', 
        level = '', 
        region = '', 
        category = '', 
        tags = [], 
        summary = '', 
        issue_date = '' 
    } = policy;
    
    const levelMap = { 
        'national': '国家级', 
        'provincial': '省级', 
        'city': '市级' 
    };
    const levelText = levelMap[level] || level || '其他';
    const levelClass = level || 'other';
    
    const tagsHtml = Array.isArray(tags) 
        ? tags.slice(0, 5).map(tag => `<span class="policy-tag">${escapeHtml(tag)}</span>`).join('')
        : '';
    
    const safeId = encodeURIComponent(id || '');
    
    return `
        <div class="policy-card" data-id="${safeId}" onclick="showPolicyDetail('${safeId}')" style="cursor:pointer;">
            <div class="policy-header">
                <h3 class="policy-title">${escapeHtml(title)}</h3>
                <span class="policy-level ${levelClass}">${escapeHtml(levelText)}</span>
            </div>
            <div class="policy-body">
                ${tagsHtml ? `<div class="policy-tags">${tagsHtml}</div>` : ''}
                <p class="policy-summary">${escapeHtml(summary || '')}</p>
                ${category ? `<p class="policy-category">分类: ${escapeHtml(category)}</p>` : ''}
            </div>
            <div class="policy-footer">
                <span class="policy-region">📍 ${escapeHtml(region || '全国')}</span>
                ${issue_date ? `<span class="policy-date">📅 ${escapeHtml(issue_date)}</span>` : ''}
            </div>
        </div>
    `;
}

// HTML 转义函数
function escapeHtml(text) {
    if (typeof text !== 'string') return String(text || '');
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 显示政策详情
function showPolicyDetail(policyId) {
    if (!policyId) {
        console.error('无效的政策 ID');
        return;
    }
    console.log('查看政策详情:', policyId);
    window.location.href = `policy-detail.html?id=${encodeURIComponent(policyId)}`;
}

// 渲染案例列表（增强版）
async function renderCases(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`❌ 容器 #${containerId} 不存在`);
        return;
    }
    
    const { 
        category, 
        province, 
        limit = 0,
        showLoading = true,
        emptyMessage = '暂无案例'
    } = options;
    
    if (showLoading) {
        container.innerHTML = '<div class="loading" style="text-align:center;padding:2rem;color:#6B5B4F;"><span class="loading-spinner">⏳</span> 加载中...</div>';
    }
    
    try {
        const cases = await fetchAllCases();
        
        // 过滤
        let filtered = cases;
        if (category) {
            filtered = filtered.filter(c => c.category === category);
        }
        if (province) {
            filtered = filtered.filter(c => c.province === province);
        }
        if (limit > 0) {
            filtered = filtered.slice(0, limit);
        }
        
        if (filtered.length === 0) {
            container.innerHTML = `<div class="empty" style="text-align:center;padding:2rem;color:#6B5B4F;">${emptyMessage}</div>`;
            return;
        }
        
        // 渲染
        const html = filtered.map(renderCaseCard).join('');
        container.innerHTML = html || `<div class="empty" style="text-align:center;padding:2rem;color:#6B5B4F;">${emptyMessage}</div>`;
        console.log(`✅ 渲染完成: ${filtered.length} 个案例`);
        
    } catch (error) {
        console.error('❌ 渲染案例失败:', error);
        container.innerHTML = '<div class="error" style="text-align:center;padding:2rem;color:#E74C3C;">加载失败，请刷新重试<br><small>' + escapeHtml(error.message) + '</small></div>';
    }
}

// 渲染政策列表（增强版）
async function renderPolicies(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`❌ 容器 #${containerId} 不存在`);
        return;
    }
    
    const { 
        level, 
        category, 
        limit = 0,
        showLoading = true,
        emptyMessage = '暂无政策'
    } = options;
    
    if (showLoading) {
        container.innerHTML = '<div class="loading" style="text-align:center;padding:2rem;color:#6B5B4F;"><span class="loading-spinner">⏳</span> 加载中...</div>';
    }
    
    try {
        const policies = await fetchAllPolicies();
        
        // 过滤
        let filtered = policies;
        if (level) {
            filtered = filtered.filter(p => p.level === level);
        }
        if (category) {
            filtered = filtered.filter(p => p.category === category);
        }
        if (limit > 0) {
            filtered = filtered.slice(0, limit);
        }
        
        if (filtered.length === 0) {
            container.innerHTML = `<div class="empty" style="text-align:center;padding:2rem;color:#6B5B4F;">${emptyMessage}</div>`;
            return;
        }
        
        // 渲染
        const html = filtered.map(renderPolicyCard).join('');
        container.innerHTML = html || `<div class="empty" style="text-align:center;padding:2rem;color:#6B5B4F;">${emptyMessage}</div>`;
        console.log(`✅ 渲染完成: ${filtered.length} 个政策`);
        
    } catch (error) {
        console.error('❌ 渲染政策失败:', error);
        container.innerHTML = '<div class="error" style="text-align:center;padding:2rem;color:#E74C3C;">加载失败，请刷新重试<br><small>' + escapeHtml(error.message) + '</small></div>';
    }
}

// 显示案例详情
function showCaseDetail(caseId) {
    if (!caseId) {
        console.error('无效的案例 ID');
        return;
    }
    console.log('查看案例详情:', caseId);
    window.location.href = `case-detail.html?id=${encodeURIComponent(caseId)}`;
}

// 更新统计显示（增强版）
async function updateStatsDisplay() {
    try {
        const stats = await fetchStats();
        
        // 更新所有统计元素
        const elements = {
            'stat-case-count': formatNumber(stats.total_cases || 0),
            'stat-policy-count': formatNumber(stats.total_policies || 0),
            'stat-brand-count': formatNumber(stats.total_brands || 0),
            'stat-province-count': '34',
            'data-version': `V${stats.data_version || '5.1'}`
        };
        
        let updatedCount = 0;
        Object.entries(elements).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) {
                // 添加动画效果
                el.style.opacity = '0';
                setTimeout(() => {
                    el.textContent = value;
                    el.style.opacity = '1';
                    el.style.transition = 'opacity 0.3s ease';
                }, 100);
                updatedCount++;
            }
        });
        
        console.log(`✅ 统计数据已更新 (${updatedCount} 个元素):`, stats);
        return stats;
    } catch (error) {
        console.error('❌ 更新统计显示失败:', error);
        // 使用默认值
        const defaults = {
            'stat-case-count': '125+',
            'stat-policy-count': '1085+',
            'stat-brand-count': '50+',
            'stat-province-count': '34',
            'data-version': 'V5.1'
        };
        Object.entries(defaults).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        });
    }
}

// 初始化
function init() {
    console.log('🚀 数据加载器 V5.1 已初始化');
    
    // 更新统计数字
    updateStatsDisplay();
    
    // 自动渲染案例容器
    const caseContainers = document.querySelectorAll('[data-cases-container]');
    caseContainers.forEach(container => {
        const options = {
            category: container.dataset.category,
            province: container.dataset.province,
            limit: parseInt(container.dataset.limit) || 0
        };
        if (container.id) {
            renderCases(container.id, options);
        }
    });
    
    // 自动渲染政策容器
    const policyContainers = document.querySelectorAll('[data-policies-container]');
    policyContainers.forEach(container => {
        const options = {
            level: container.dataset.level,
            category: container.dataset.category,
            limit: parseInt(container.dataset.limit) || 0
        };
        if (container.id) {
            renderPolicies(container.id, options);
        }
    });
}

// DOM 加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// 导出 API
window.WenChangData = {
    // 数据获取
    fetchStats,
    fetchAllCases,
    fetchAllPolicies,
    fetchLocalJson,
    fetchMultipleJson,
    
    // 渲染
    renderCases,
    renderPolicies,
    renderCaseCard,
    renderPolicyCard,
    updateStatsDisplay,
    
    // 工具
    showCaseDetail,
    showPolicyDetail,
    formatNumber,
    escapeHtml,
    clearCache,
    
    // 配置
    CONFIG,
    
    // 版本
    VERSION: '5.1'
};
