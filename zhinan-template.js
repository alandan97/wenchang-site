// 文创设计师模板规范数据
const DESIGNER_TEMPLATE = {
  // 色彩系统 - 唐风配色
  colors: {
    primary: '#8B1E1E',      // 朱砂红
    secondary: '#C89B3C',    // 金色
    accent: '#2D5A4A',       // 墨绿
    background: '#FDF8F0',   // 米白
    text: '#2C1810',         // 墨黑
    textSecondary: '#6B5B4F' // 灰褐
  },
  
  // 字体规范
  typography: {
    title: "'Noto Serif SC', 'Source Han Serif SC', serif",
    body: "'Noto Sans SC', 'Source Han Sans SC', sans-serif",
    display: "'ZCOOL XiaoWei', 'Ma Shan Zheng', cursive"
  },
  
  // 案例分析框架
  caseFramework: {
    sections: [
      {
        id: 'overview',
        title: '项目概览',
        icon: '◆',
        required: true,
        fields: ['name', 'category', 'location', 'founding_year', 'scale']
      },
      {
        id: 'brand',
        title: '品牌基因',
        icon: '◎',
        required: true,
        fields: ['core_values', 'brand_story', 'visual_identity', 'slogan']
      },
      {
        id: 'product',
        title: '产品体系',
        icon: '◈',
        required: true,
        fields: ['product_lines', 'price_range', 'materials', 'craftsmanship']
      },
      {
        id: 'market',
        title: '市场定位',
        icon: '◉',
        required: true,
        fields: ['target_audience', 'market_segment', 'competitive_advantage']
      },
      {
        id: 'channel',
        title: '渠道策略',
        icon: '◊',
        required: true,
        fields: ['online_channels', 'offline_channels', 'distribution']
      },
      {
        id: 'marketing',
        title: '营销传播',
        icon: '◐',
        required: true,
        fields: ['marketing_strategy', 'ip_collaborations', 'social_media', 'events']
      },
      {
        id: 'data',
        title: '核心数据',
        icon: '◑',
        required: true,
        fields: ['revenue', 'growth_rate', 'customer_count', 'market_share']
      },
      {
        id: 'swot',
        title: 'SWOT分析',
        icon: '◒',
        required: true,
        fields: ['strengths', 'weaknesses', 'opportunities', 'threats']
      },
      {
        id: 'insight',
        title: '设计洞察',
        icon: '◓',
        required: true,
        fields: ['design_highlights', 'cultural_elements', 'innovation_points']
      },
      {
        id: 'future',
        title: '发展展望',
        icon: '◔',
        required: true,
        fields: ['expansion_plan', 'digital_strategy', 'sustainability']
      }
    ]
  },
  
  // 数据可视化规范
  dataViz: {
    chartColors: ['#8B1E1E', '#C89B3C', '#2D5A4A', '#D4A574', '#1a365d'],
    numberFormat: 'chinese',
    currencyUnit: '万元',
    percentagePrecision: 1
  }
};

// 示例案例数据 - 严格按照模板
const CASE_STUDIES = [
  {
    id: "case_gugong",
    name: "故宫文创",
    category: "博物馆文创",
    subcategory: "文化IP衍生",
    location: "北京市东城区",
    founding_year: 2008,
    scale: "大型",
    
    // 品牌基因
    brand: {
      core_values: "让文物活起来，让传统文化走进现代生活",
      brand_story: "以故宫博物院186万件文物为灵感源泉，将皇家美学转化为当代设计语言",
      visual_identity: "朱红、明黄、石青等传统宫廷色系，融合祥云、龙纹、瑞兽等吉祥元素",
      slogan: "来自故宫的礼物"
    },
    
    // 产品体系
    product: {
      lines: [
        { name: "彩妆系列", items: ["口红", "眼影", "腮红"], price: "99-299元" },
        { name: "文具系列", items: ["胶带", "笔记本", "书签"], price: "15-128元" },
        { name: "饰品系列", items: ["项链", "耳环", "手镯"], price: "168-888元" },
        { name: "家居系列", items: ["茶具", "香薰", "抱枕"], price: "128-1680元" }
      ],
      price_range: { min: 15, max: 1680, avg: 168 },
      materials: ["黄铜", "珐琅", "丝绸", "陶瓷", "纸张"],
      craftsmanship: ["珐琅彩", "刺绣", "錾刻", "掐丝"]
    },
    
    // 市场定位
    market: {
      target_audience: {
        age: "18-35岁",
        gender: "女性为主(68%)",
        income: "月收入8000-20000元",
        education: "本科及以上学历",
        lifestyle: "追求品质生活，热爱传统文化，活跃于社交媒体"
      },
      market_segment: "中高端文化消费品市场",
      competitive_advantage: "独家IP资源、深厚文化底蕴、强大品牌背书"
    },
    
    // 渠道策略
    channel: {
      online: {
        platforms: ["天猫旗舰店", "微信小程序", "抖音直播间", "小红书"],
        revenue_share: "65%",
        strategies: ["限时限量发售", "会员专属折扣", "直播带货"]
      },
      offline: {
        locations: ["故宫神武门", "机场店", "商场专柜", "景区店"],
        revenue_share: "35%",
        experience: "沉浸式购物体验，AR文物互动"
      }
    },
    
    // 营销传播
    marketing: {
      strategy: "内容营销+社交裂变+KOL种草",
      ip_collaborations: ["毛戈平彩妆", "Kindle", "晨光文具", "安踏"],
      social_media: {
        weibo: "粉丝580万，月均互动50万+",
        wechat: "粉丝1200万，阅读量10万+",
        douyin: "粉丝800万，视频播放量过亿",
        xiaohongshu: "笔记10万+，种草转化率高"
      },
      events: ["故宫上元灯会", "文物修复直播", "设计师联名发布会"]
    },
    
    // 核心数据
    data: {
      revenue: { value: 15, unit: "亿元", growth: "+25%", year: 2023 },
      product_count: { value: 10000, unit: "+" },
      store_count: { value: 12, unit: "家" },
      online_fans: { value: 2500, unit: "万" },
      customer_satisfaction: { value: 96, unit: "%" },
      repurchase_rate: { value: 42, unit: "%" }
    },
    
    // SWOT分析
    swot: {
      strengths: [
        "独家文物IP资源，不可复制",
        "品牌认知度极高，自带流量",
        "产品线丰富，覆盖多价位段",
        "线上线下渠道成熟"
      ],
      weaknesses: [
        "产品创新压力大，需持续出新",
        "部分产品价格偏高，受众受限",
        "库存管理复杂，SKU众多",
        "对设计师依赖度高"
      ],
      opportunities: [
        "国潮文化持续升温",
        "文旅融合政策支持",
        "数字化营销手段丰富",
        "海外市场拓展空间"
      ],
      threats: [
        "竞品模仿速度快",
        "消费者审美疲劳风险",
        "文物授权政策变化",
        "经济下行影响消费"
      ]
    },
    
    // 设计洞察
    insight: {
      highlights: [
        "将严肃文物转化为趣味化、生活化产品",
        "传统色彩与现代审美的平衡",
        "功能性与装饰性的统一"
      ],
      cultural_elements: [
        "提取文物核心视觉符号",
        "重构传统吉祥图案",
        "融入宫廷生活场景"
      ],
      innovation_points: [
        "首创博物馆文创模式",
        "跨界联名破圈策略",
        "数字化互动体验"
      ]
    },
    
    // 发展展望
    future: {
      expansion_plan: "2025年门店覆盖主要省会城市，产品SKU突破15000",
      digital_strategy: "发展数字藏品、元宇宙展厅、AI设计工具",
      sustainability: "推进环保材料使用，建立文创产业生态联盟"
    }
  }
];

// 导出模板和数据
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DESIGNER_TEMPLATE, CASE_STUDIES };
}
