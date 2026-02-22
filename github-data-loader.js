// 动态加载本地静态数据
// 从 data/ 目录获取案例和政策数据

const CONFIG = {
    dataPath: './data'
};

// 缓存机制
let dataCache = null;
let lastFetch = null;
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
    if (dataCache && lastFetch && (Date.now() - lastFetch < CACHE_DURATION)) {
        return dataCache;
    }
    
    const data = await fetchLocalJson('summary.json');
    if (data) {
        dataCache = data;
        lastFetch = Date.now();
    }
    return data || { total_cases: 854, total_policies: 440, total_brands: 156 };
}

// 获取案例列表
async function fetchCases() {
    return await fetchLocalJson('cases.json') || [];
}

// 获取政策列表
async function fetchPolicies() {
    return await fetchLocalJson('policies.json') || [];
}

// 获取统计信息（简化版）
async function getStats() {
    const stats = await fetchStats();
    return {
        totalCases: stats.total_cases || 0,
        totalPolicies: stats.total_policies || 0,
        totalBrands: stats.total_brands || 0,
        progressPercent: stats.progress_percent || 0
    };
}

// 更新统计显示
async function updateStatsDisplay() {
    try {
        const stats = await getStats();
        
        // 更新页面上的统计数字
        const caseCountEl = document.getElementById('stat-case-count');
        const policyCountEl = document.getElementById('stat-policy-count');
        const brandCountEl = document.getElementById('stat-brand-count');
        const provinceCountEl = document.getElementById('stat-province-count');
        
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
        
        console.log('统计数据已更新:', stats);
    } catch (error) {
        console.error('更新统计显示失败:', error);
    }
}

// 渲染案例卡片
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

// 渲染案例列表到容器
async function renderCases(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`容器 #${containerId} 不存在`);
        return;
    }
    
    container.innerHTML = '<div class="loading" style="text-align:center;padding:2rem;color:#6B5B4F;">加载中...</div>';
    
    try {
        let cases = await fetchCases();
        
        // 过滤
        if (options.category) {
            cases = cases.filter(c => c.category === options.category);
        }
        if (options.province) {
            cases = cases.filter(c => c.province === options.province);
        }
        if (options.limit) {
            cases = cases.slice(0, options.limit);
        }
        
        if (cases.length === 0) {
            container.innerHTML = '<div class="empty" style="text-align:center;padding:2rem;color:#6B5B4F;">暂无案例</div>';
            return;
        }
        
        container.innerHTML = cases.map(renderCaseCard).join('');
        
    } catch (error) {
        console.error('渲染案例失败:', error);
        container.innerHTML = '<div class="error" style="text-align:center;padding:2rem;color:#E74C3C;">加载失败，请刷新重试</div>';
    }
}

// 渲染政策卡片
function renderPolicyCard(policy) {
    const { id, title, level, province, year, summary } = policy;
    
    return `
        <div class="policy-card" data-id="${id}">
            <div class="policy-header">
                <h3 class="policy-title">${title}</h3>
                <span class="policy-level">${level}</span>
            </div>
            <div class="policy-body">
                <p class="policy-summary">${summary || ''}</p>
            </div>
            <div class="policy-footer">
                <span class="policy-year">📅 ${year}年</span>
                ${province ? `<span class="policy-province">📍 ${province}</span>` : ''}
            </div>
        </div>
    `;
}

// 渲染政策列表
async function renderPolicies(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '<div class="loading" style="text-align:center;padding:2rem;color:#6B5B4F;">加载中...</div>';
    
    try {
        const policies = await fetchPolicies();
        
        if (policies.length === 0) {
            container.innerHTML = '<div class="empty" style="text-align:center;padding:2rem;color:#6B5B4F;">暂无政策</div>';
            return;
        }
        
        container.innerHTML = policies.map(renderPolicyCard).join('');
        
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

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('数据加载器已初始化');
    
    // 更新统计数字
    updateStatsDisplay();
    
    // 自动渲染带有 data-cases-container 属性的容器
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
        renderPolicies(container.id);
    });
});

// 导出 API
window.WenChangData = {
    fetchStats,
    fetchCases,
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
