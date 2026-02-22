// 动态加载本地静态数据 - 深度分析版 V2.0
// 支持文创分析师模板的十维深度分析数据

const CONFIG = {
    dataPath: './data'
};

// 缓存机制
let dataCache = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

// 获取本地 JSON 数据
async function fetchLocalJson(filename) {
    try {
        const response = await fetch(`${CONFIG.dataPath}/${filename}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`获取 ${filename} 失败:`, error);
        return null;
    }
}

// 获取汇总统计
async function fetchStats() {
    const cacheKey = 'stats';
    if (dataCache[cacheKey] && dataCache[cacheKey].timestamp > Date.now() - CACHE_DURATION) {
        return dataCache[cacheKey].data;
    }
    
    const data = await fetchLocalJson('summary.json');
    if (data) {
        dataCache[cacheKey] = { data, timestamp: Date.now() };
    }
    return data || { total_cases: 904, total_policies: 467, total_brands: 156, data_version: '2.0' };
}

// 获取案例列表（简化版）
async function fetchCases() {
    return await fetchLocalJson('cases.json') || [];
}

// 获取深度分析案例
async function fetchDeepAnalysisCases() {
    return await fetchLocalJson('deep_analysis_cases.json') || [];
}

// 获取政策列表
async function fetchPolicies() {
    return await fetchLocalJson('policies.json') || [];
}

// 获取统计信息
async function getStats() {
    const stats = await fetchStats();
    return {
        totalCases: stats.total_cases || 0,
        totalPolicies: stats.total_policies || 0,
        totalBrands: stats.total_brands || 0,
        progressPercent: stats.progress_percent || 0,
        dataVersion: stats.data_version || '1.0'
    };
}

// 更新统计显示
async function updateStatsDisplay() {
    try {
        const stats = await getStats();
        
        const caseCountEl = document.getElementById('stat-case-count');
        const policyCountEl = document.getElementById('stat-policy-count');
        const brandCountEl = document.getElementById('stat-brand-count');
        const provinceCountEl = document.getElementById('stat-province-count');
        const versionEl = document.getElementById('data-version');
        
        if (caseCountEl) {
            caseCountEl.textContent = stats.totalCases.toLocaleString();
            caseCountEl.style.opacity = '1';
        }
        if (policyCountEl) {
            policyCountEl.textContent = stats.totalPolicies.toLocaleString();
            policyCountEl.style.opacity = '1';
        }
        if (brandCountEl) {
            brandCountEl.textContent = stats.totalBrands.toLocaleString();
            brandCountEl.style.opacity = '1';
        }
        if (provinceCountEl) {
            provinceCountEl.textContent = '34';
            provinceCountEl.style.opacity = '1';
        }
        if (versionEl) {
            versionEl.textContent = `V${stats.dataVersion}`;
        }
        
        console.log('统计数据已更新:', stats);
    } catch (error) {
        console.error('更新统计显示失败:', error);
    }
}

// 渲染案例卡片（简化版）
function renderCaseCard(caseData) {
    const { id, name, brand, category, province, city, description, highlights = [] } = caseData;
    
    return `
        <div class="case-card" data-id="${id}" onclick="showCaseDetail('${id}')">
            <div class="case-header">
                <h3 class="case-title">${name}</h3>
                <span class="case-brand">${brand}</span>
            </div>
            <div class="case-body">
                <p class="case-description">${description || ''}</p>
                ${highlights.length > 0 ? `
                    <div class="case-highlights">
                        ${highlights.map(h => `<span class="highlight-tag">${h}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
            <div class="case-footer">
                <span class="case-location">📍 ${city || province || '未知'}</span>
                <span class="case-category">${category}</span>
            </div>
        </div>
    `;
}

// 渲染深度分析案例卡片
function renderDeepCaseCard(caseData) {
    const { id, name, category, brand, product_info, kpi_data, location } = caseData;
    
    const province = location?.province || '未知';
    const city = location?.city || '';
    const material = product_info?.material_craft?.substring(0, 50) + '...' || '';
    const revenue = kpi_data?.revenue || '';
    
    return `
        <div class="case-card deep-analysis" data-id="${id}" onclick="showDeepCaseDetail('${id}')">
            <div class="case-header">
                <h3 class="case-title">${name}</h3>
                <span class="case-brand">${brand}</span>
                <span class="analysis-badge">深度分析</span>
            </div>
            <div class="case-body">
                <p class="case-description"><strong>材质工艺:</strong> ${material}</p>
                <p class="case-kpi"><strong>营收规模:</strong> ${revenue}</p>
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
    const { id, title, level, region, category, tags = [], metadata } = policy;
    
    const levelText = {
        'national': '国家级',
        'provincial': '省级',
        'city': '市级'
    }[level] || level;
    
    return `
        <div class="policy-card" data-id="${id}">
            <div class="policy-header">
                <h3 class="policy-title">${title}</h3>
                <span class="policy-level ${level}">${levelText}</span>
            </div>
            <div class="policy-body">
                <div class="policy-tags">
                    ${tags.map(tag => `<span class="policy-tag">${tag}</span>`).join('')}
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
        let cases = [];
        
        // 优先加载深度分析案例
        if (options.deepAnalysis) {
            cases = await fetchDeepAnalysisCases();
        } else {
            cases = await fetchCases();
        }
        
        // 过滤
        if (options.category) {
            cases = cases.filter(c => c.category === options.category);
        }
        if (options.province) {
            cases = cases.filter(c => c.province === options.province || c.location?.province === options.province);
        }
        if (options.limit) {
            cases = cases.slice(0, options.limit);
        }
        
        if (cases.length === 0) {
            container.innerHTML = '<div class="empty" style="text-align:center;padding:2rem;color:#6B5B4F;">暂无案例</div>';
            return;
        }
        
        // 根据数据类型选择渲染方式
        const renderFn = options.deepAnalysis ? renderDeepCaseCard : renderCaseCard;
        container.innerHTML = cases.map(renderFn).join('');
        
    } catch (error) {
        console.error('渲染案例失败:', error);
        container.innerHTML = '<div class="error" style="text-align:center;padding:2rem;color:#E74C3C;">加载失败，请刷新重试</div>';
    }
}

// 渲染政策列表
async function renderPolicies(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '<div class="loading" style="text-align:center;padding:2rem;color:#6B5B4F;">加载中...</div>';
    
    try {
        const policies = await fetchPolicies();
        
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
        
    } catch (error) {
        console.error('渲染政策失败:', error);
        container.innerHTML = '<div class="error" style="text-align:center;padding:2rem;color:#E74C3C;">加载失败</div>';
    }
}

// 显示案例详情
function showCaseDetail(caseId) {
    console.log('查看案例详情:', caseId);
    // 可以跳转到详情页或显示弹窗
    // window.location.href = `case-detail.html?id=${caseId}`;
}

// 显示深度分析案例详情
function showDeepCaseDetail(caseId) {
    console.log('查看深度分析案例:', caseId);
    // window.location.href = `deep-case-detail.html?id=${caseId}`;
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('数据加载器 V2.0 已初始化');
    
    // 更新统计数字
    updateStatsDisplay();
    
    // 自动渲染带有 data-cases-container 属性的容器
    const caseContainers = document.querySelectorAll('[data-cases-container]');
    caseContainers.forEach(container => {
        const options = {
            category: container.dataset.category,
            province: container.dataset.province,
            limit: parseInt(container.dataset.limit) || undefined,
            deepAnalysis: container.dataset.deep === 'true'
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
    fetchCases,
    fetchDeepAnalysisCases,
    fetchPolicies,
    getStats,
    updateStatsDisplay,
    renderCases,
    renderPolicies,
    renderCaseCard,
    renderDeepCaseCard,
    renderPolicyCard,
    showCaseDetail,
    showDeepCaseDetail,
    CONFIG
};
