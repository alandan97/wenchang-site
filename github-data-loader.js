// 文创指南数据加载器 V5.0 - 简化版
// 使用预生成的本地数据，确保稳定性和速度

const CONFIG = {
    dataPath: './data'
};

// 缓存
let dataCache = {
    cases: null,
    policies: null,
    stats: null
};

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

// 获取本地 JSON 数据
async function fetchLocalJson(filename) {
    try {
        const response = await fetch(`${CONFIG.dataPath}/${filename}`);
        if (!response.ok) {
            console.warn(`获取 ${filename} 失败: ${response.status}`);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(`获取 ${filename} 出错:`, error);
        return null;
    }
}

// 获取所有案例（使用摘要数据）
async function fetchAllCases() {
    if (dataCache.cases) {
        return dataCache.cases;
    }
    
    // 首先尝试加载摘要数据
    let cases = await fetchLocalJson('cases_summary.json');
    
    if (!cases || cases.length === 0) {
        // 降级到 cases.json
        cases = await fetchLocalJson('cases.json') || [];
    }
    
    dataCache.cases = cases;
    console.log(`加载了 ${cases.length} 个案例`);
    return cases;
}

// 获取所有政策
async function fetchAllPolicies() {
    if (dataCache.policies) {
        return dataCache.policies;
    }
    
    // 首先尝试加载摘要数据
    let policies = await fetchLocalJson('policies_summary.json');
    
    if (!policies || policies.length === 0) {
        // 降级到 policies.json
        policies = await fetchLocalJson('policies.json') || [];
    }
    
    dataCache.policies = policies;
    console.log(`加载了 ${policies.length} 个政策`);
    return policies;
}

// 获取统计数据
async function fetchStats() {
    if (dataCache.stats) {
        return dataCache.stats;
    }
    
    let stats = await fetchLocalJson('stats.json');
    
    if (!stats) {
        stats = await fetchLocalJson('summary.json');
    }
    
    if (!stats) {
        stats = {
            total_cases: 1000,
            total_policies: 517,
            total_brands: 156,
            data_version: '5.0'
        };
    }
    
    dataCache.stats = stats;
    return stats;
}

// 渲染案例卡片
function renderCaseCard(caseData) {
    const { id, name, brand, category, province, city, description, highlights = [], kpi = {} } = caseData;
    
    const location = city || province || '未知';
    const desc = description || '';
    const highlightsHtml = highlights.slice(0, 3).map(h => 
        `<span class="highlight-tag">${h}</span>`
    ).join('');
    
    return `
        <div class="case-card" data-id="${id}" onclick="showCaseDetail('${id}')">
            <div class="case-header">
                <h3 class="case-title">${name}</h3>
                <span class="case-brand">${brand}</span>
            </div>
            <div class="case-body">
                <p class="case-description">${desc}</p>
                ${highlightsHtml ? `<div class="case-highlights">${highlightsHtml}</div>` : ''}
                <div class="case-stats-mini">
                    <span>📊 销量: ${kpi.sales_volume || 'N/A'}</span>
                    <span>💰 营收: ${kpi.revenue || 'N/A'}</span>
                </div>
            </div>
            <div class="case-footer">
                <span class="case-location">📍 ${location}</span>
                <span class="case-category">${category}</span>
            </div>
        </div>
    `;
}

// 渲染政策卡片
function renderPolicyCard(policy) {
    const { id, title, level, region, category, tags = [], summary, issue_date } = policy;
    
    const levelText = { 'national': '国家级', 'provincial': '省级', 'city': '市级' }[level] || level;
    const levelClass = level || 'national';
    const tagsHtml = (tags || []).slice(0, 5).map(tag => 
        `<span class="policy-tag">${tag}</span>`
    ).join('');
    
    return `
        <div class="policy-card" data-id="${id}">
            <div class="policy-header">
                <h3 class="policy-title">${title}</h3>
                <span class="policy-level ${levelClass}">${levelText}</span>
            </div>
            <div class="policy-body">
                ${tagsHtml ? `<div class="policy-tags">${tagsHtml}</div>` : ''}
                <p class="policy-summary">${summary || ''}</p>
                <p class="policy-category">分类: ${category || '其他'}</p>
            </div>
            <div class="policy-footer">
                <span class="policy-region">📍 ${region || '全国'}</span>
                <span class="policy-date">📅 ${issue_date || ''}</span>
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
            filtered = filtered.filter(c => c.province === options.province);
        }
        if (options.limit && options.limit > 0) {
            filtered = filtered.slice(0, options.limit);
        }
        
        if (filtered.length === 0) {
            container.innerHTML = '<div class="empty" style="text-align:center;padding:2rem;color:#6B5B4F;">暂无案例</div>';
            return;
        }
        
        // 渲染
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
        if (options.limit && options.limit > 0) {
            filtered = filtered.slice(0, options.limit);
        }
        
        if (filtered.length === 0) {
            container.innerHTML = '<div class="empty" style="text-align:center;padding:2rem;color:#6B5B4F;">暂无政策</div>';
            return;
        }
        
        // 渲染
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
            'data-version': `V${stats.data_version || '5.0'}`
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
    console.log('数据加载器 V5.0 已初始化');
    
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
