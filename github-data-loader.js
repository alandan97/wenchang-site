// 动态加载 GitHub 数据 - 简化版
// 从 wenchang-data 仓库获取统计数据

const CONFIG = {
    owner: 'alandan97',
    repo: 'wenchang-data',
    rawBaseUrl: 'https://raw.githubusercontent.com/alandan97/wenchang-data/main'
};

// 缓存机制
let statsCache = null;
let lastFetch = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

// 获取统计信息
async function fetchStats() {
    // 检查缓存
    if (statsCache && lastFetch && (Date.now() - lastFetch < CACHE_DURATION)) {
        console.log('使用缓存的统计数据');
        return statsCache;
    }
    
    try {
        const response = await fetch(`${CONFIG.rawBaseUrl}/stats/progress.json`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        
        // 更新缓存
        statsCache = data;
        lastFetch = Date.now();
        
        return data;
    } catch (error) {
        console.error('获取统计数据失败:', error);
        return { 
            total_cases: 854, 
            total_policies: 0,
            progress_percent: 42.7
        };
    }
}

// 获取统计信息（简化版）
async function getStats() {
    const stats = await fetchStats();
    return {
        totalCases: stats.total_cases || 0,
        totalPolicies: stats.total_policies || 0,
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
        const provinceCountEl = document.getElementById('stat-province-count');
        
        if (caseCountEl) {
            caseCountEl.textContent = stats.totalCases;
            caseCountEl.style.opacity = '1';
        }
        if (policyCountEl) {
            policyCountEl.textContent = stats.totalPolicies;
            policyCountEl.style.opacity = '1';
        }
        if (provinceCountEl) {
            // 从案例数据推断省份数，这里用固定值
            provinceCountEl.textContent = '15';
            provinceCountEl.style.opacity = '1';
        }
        
        console.log('统计数据已更新:', stats);
    } catch (error) {
        console.error('更新统计显示失败:', error);
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('动态数据加载器已初始化');
    
    // 更新统计数字
    updateStatsDisplay();
});

// 导出 API
window.WenChangData = {
    fetchStats,
    getStats,
    updateStatsDisplay,
    CONFIG
};
