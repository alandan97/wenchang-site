// 测试案例数据 - 按照文创产品分析师模板优化
const TEST_CASES = [
  {
    "id": "test_gugong_calendar",
    "name": "故宫日历 2026 书画版",
    "category": "博物馆文创",
    "subcategory": "日历/文具",
    "brand": "故宫文创",
    "company": "故宫博物院",
    "location": "北京市",
    "founding_year": 2025,
    "launch_date": "2025-09",
    "scale": "大型",
    
    // 产品信息
    "product": {
      "name": "故宫日历 2026 书画版",
      "price": 98,
      "price_unit": "元",
      "specs": "32开（145×210mm）",
      "materials": ["艺术纸印刷", "精装裱糊"],
      "craftsmanship": ["四色印刷", "烫金工艺", "锁线装订"]
    },
    
    // 品牌基因
    "brand": {
      "core_values": "传播中国传统文化，让文物活起来",
      "brand_story": "以故宫博物院186万件文物为灵感，每日呈现一件故宫珍藏书画",
      "visual_identity": "宫廷红、祥云纹、传统书画元素",
      "slogan": "来自故宫的礼物"
    },
    
    // 核心数据
    "data": {
      "sales_volume": { "value": 500000, "unit": "件", "label": "累计销量" },
      "monthly_sales": { "value": 80000, "unit": "件", "label": "月均销量" },
      "revenue": { "value": 49000000, "unit": "元", "label": "累计营收" },
      "conversion_rate": { "value": 4.2, "unit": "%", "label": "转化率" },
      "repurchase_rate": { "value": 35, "unit": "%", "label": "复购率" }
    },
    
    // 用户画像
    "user_persona": {
      "age": "25-45岁",
      "gender": "女性60% · 男性40%",
      "income": "中高收入",
      "education": "本科及以上学历",
      "cities": ["北京", "上海", "广州", "深圳", "杭州"],
      "motivations": ["送礼", "收藏", "自用", "文化爱好", "商务往来"],
      "price_sensitivity": "中等"
    },
    
    // 渠道策略
    "channels": {
      "online": {
        "platforms": ["淘宝官方旗舰店", "天猫", "微信小程序"],
        "share": "60%"
      },
      "offline": {
        "locations": ["故宫线下店", "文创集合店"],
        "share": "40%"
      }
    },
    
    // IP分析
    "ip_analysis": {
      "name": "故宫",
      "type": "自有",
      "holder": "故宫博物院",
      "innovation_score": 9.5,
      "cultural_elements": ["宫廷书画", "传统文化", "百年故宫", "艺术美学", "历史传承"]
    },
    
    // 竞品分析
    "competitors": [
      { "name": "国家博物馆日历", "brand": "国家博物馆", "price": 88, "share": "15%", "advantage": "价格较低, 国博背书" },
      { "name": "敦煌日历", "brand": "敦煌研究院", "price": 98, "share": "12%", "advantage": "艺术价值高, 特色鲜明" },
      { "name": "西西弗日历", "brand": "西西弗书店", "price": 68, "share": "18%", "advantage": "渠道广泛, 价格亲民" }
    ],
    
    // SWOT分析
    "swot": {
      "strengths": ["独家文物IP资源", "品牌认知度极高", "产品品质优良", "文化内涵深厚"],
      "weaknesses": ["价格略高于竞品", "季节性销售明显", "创新迭代压力大"],
      "opportunities": ["国潮文化持续升温", "文创礼品市场增长", "数字化营销拓展"],
      "threats": ["竞品模仿跟进", "消费者审美疲劳", "IP授权政策变化"]
    },
    
    // 发展建议
    "recommendations": {
      "short_term": ["优化产品详情页，突出文化故事", "开展限时促销活动", "收集用户反馈快速迭代"],
      "medium_term": ["拓展线下文创集合店渠道", "开发系列化产品矩阵", "建立用户社群提升复购"],
      "long_term": ["打造品牌IP认知", "探索跨界联名合作", "布局海外市场输出"]
    }
  },
  
  {
    "id": "test_lotus_buddha",
    "name": "欢喜合什莲花小佛挂",
    "category": "宗教文创",
    "subcategory": "饰品/挂件",
    "brand": "欢喜文创",
    "company": "佛教文化机构",
    "location": "浙江省",
    "founding_year": 2023,
    "launch_date": "2023-06",
    "scale": "成长型",
    
    // 产品信息
    "product": {
      "name": "欢喜合什莲花小佛挂",
      "price": 68,
      "price_unit": "元",
      "specs": "约8cm×5cm",
      "materials": ["天然檀木", "菩提子", "手工绳结"],
      "craftsmanship": ["手工雕刻", "传统结艺", "天然染色"]
    },
    
    // 品牌基因
    "brand": {
      "core_values": "传递欢喜与祥和，让佛法融入生活",
      "brand_story": "以佛教文化为根基，将传统佛像艺术转化为现代生活美学",
      "visual_identity": "莲花、佛手、祥云、暖金色系",
      "slogan": "一念欢喜，万事顺遂"
    },
    
    // 核心数据
    "data": {
      "sales_volume": { "value": 120000, "unit": "件", "label": "累计销量" },
      "monthly_sales": { "value": 15000, "unit": "件", "label": "月均销量" },
      "revenue": { "value": 8160000, "unit": "元", "label": "累计营收" },
      "conversion_rate": { "value": 5.8, "unit": "%", "label": "转化率" },
      "repurchase_rate": { "value": 28, "unit": "%", "label": "复购率" }
    },
    
    // 用户画像
    "user_persona": {
      "age": "25-50岁",
      "gender": "女性70% · 男性30%",
      "income": "中等收入",
      "education": "高中及以上学历",
      "cities": ["杭州", "上海", "成都", "厦门", "深圳"],
      "motivations": ["祈福保平安", "送礼祝福", "装饰美化", "信仰表达"],
      "price_sensitivity": "中等偏低"
    },
    
    // 渠道策略
    "channels": {
      "online": {
        "platforms": ["淘宝", "拼多多", "抖音直播", "小红书"],
        "share": "75%"
      },
      "offline": {
        "locations": ["寺庙文创店", "景区商店", "书店"],
        "share": "25%"
      }
    },
    
    // IP分析
    "ip_analysis": {
      "name": "佛教文化",
      "type": "公共IP",
      "holder": "传统文化",
      "innovation_score": 7.5,
      "cultural_elements": ["莲花", "佛手", "合什", "祈福", "禅意"]
    },
    
    // 竞品分析
    "competitors": [
      { "name": "观音平安挂", "brand": "传统品牌", "price": 38, "share": "20%", "advantage": "价格低, 传统款式" },
      { "name": "转运珠挂件", "brand": "珠宝品牌", "price": 168, "share": "15%", "advantage": "材质贵重, 品牌背书" }
    ],
    
    // SWOT分析
    "swot": {
      "strengths": ["设计独特新颖", "寓意美好吉祥", "手工制作精良", "价格亲民"],
      "weaknesses": ["品牌知名度有限", "产能受限", "渠道覆盖不足"],
      "opportunities": ["心灵消费趋势", "寺庙旅游兴起", "直播带货红利"],
      "threats": ["同质化竞争", "宗教政策风险", "原材料涨价"]
    },
    
    // 发展建议
    "recommendations": {
      "short_term": ["加强抖音小红书种草", "优化产品包装设计", "推出节日限定款"],
      "medium_term": ["拓展寺庙渠道合作", "开发系列化产品", "建立私域流量池"],
      "long_term": ["打造宗教文创品牌", "跨界艺术合作", "出海东南亚市场"]
    }
  },
  
  {
    "id": "test_gugong_lipstick",
    "name": "故宫口红",
    "category": "文创IP",
    "subcategory": "彩妆",
    "brand": "故宫文创",
    "company": "故宫博物院",
    "location": "北京市",
    "founding_year": 2018,
    "launch_date": "2018-12",
    "scale": "大型",
    
    // 产品信息
    "product": {
      "name": "故宫口红",
      "price": 199,
      "price_unit": "元",
      "specs": "标准口红规格",
      "materials": ["天然成分", "植物油脂", "矿物色素"],
      "craftsmanship": ["传统配色", "现代工艺", "安全检测"]
    },
    
    // 品牌基因
    "brand": {
      "core_values": "让文物活起来，让传统文化走进现代生活",
      "brand_story": "以故宫博物院珍藏文物为灵感，将宫廷色彩转化为现代彩妆",
      "visual_identity": "朱红、明黄、石青等传统宫廷色系，祥云、龙纹、瑞兽",
      "slogan": "来自故宫的礼物"
    },
    
    // 核心数据
    "data": {
      "sales_volume": { "value": 500000, "unit": "件", "label": "累计销量" },
      "monthly_sales": { "value": 15000, "unit": "件", "label": "月均销量" },
      "revenue": { "value": 99500000, "unit": "元", "label": "累计营收" },
      "conversion_rate": { "value": 3.5, "unit": "%", "label": "转化率" },
      "repurchase_rate": { "value": 25, "unit": "%", "label": "复购率" }
    },
    
    // 用户画像
    "user_persona": {
      "age": "18-35岁",
      "gender": "女性85% · 男性15%",
      "income": "月收入8000-20000元",
      "education": "本科及以上学历",
      "cities": ["北京", "上海", "广州", "深圳", "成都"],
      "motivations": ["收藏", "送礼", "自用", "文化认同"],
      "price_sensitivity": "中等"
    },
    
    // 渠道策略
    "channels": {
      "online": {
        "platforms": ["天猫旗舰店", "微信小程序", "抖音直播"],
        "share": "65%"
      },
      "offline": {
        "locations": ["故宫线下店", "机场店", "商场专柜"],
        "share": "35%"
      }
    },
    
    // IP分析
    "ip_analysis": {
      "name": "故宫",
      "type": "自有",
      "holder": "故宫博物院",
      "innovation_score": 9.0,
      "cultural_elements": ["宫廷文化", "传统色彩", "吉祥图案", "皇家美学"]
    },
    
    // 竞品分析
    "competitors": [
      { "name": "花西子雕花口红", "brand": "花西子", "price": 129, "share": "15%", "advantage": "性价比高, 营销强, 设计精美" },
      { "name": "完美日记小细跟", "brand": "完美日记", "price": 99, "share": "20%", "advantage": "价格亲民, 渠道广, 更新快" }
    ],
    
    // SWOT分析
    "swot": {
      "strengths": ["独家IP资源", "高品牌认知度", "产品品质优良", "文化内涵深厚"],
      "weaknesses": ["价格偏高", "产品创新压力大", "库存管理复杂"],
      "opportunities": ["国潮文化升温", "文旅融合政策", "数字化营销拓展"],
      "threats": ["竞品模仿", "IP授权成本上升", "消费者审美疲劳"]
    },
    
    // 发展建议
    "recommendations": {
      "short_term": ["优化产品详情页", "开展限时促销", "收集用户反馈"],
      "medium_term": ["拓展线下渠道", "开发系列化产品", "建立用户社群"],
      "long_term": ["打造品牌IP", "探索跨界联名", "布局海外市场"]
    }
  },
  
  {
    "id": "test_popmart_star",
    "name": "泡泡玛特星星人怦然星动毛绒挂件盲盒",
    "category": "潮玩盲盒",
    "subcategory": "毛绒玩具",
    "brand": "泡泡玛特",
    "company": "泡泡玛特",
    "location": "北京市",
    "founding_year": 2020,
    "launch_date": "2020-11",
    "scale": "大型",
    
    // 产品信息
    "product": {
      "name": "星星人怦然星动毛绒挂件盲盒",
      "price": 69,
      "price_unit": "元",
      "specs": "约12cm",
      "materials": ["优质短毛绒", "PP棉填充", "金属配件"],
      "craftsmanship": ["刺绣工艺", "手工缝制", "品质检测"]
    },
    
    // 品牌基因
    "brand": {
      "core_values": "创造潮流，传递美好",
      "brand_story": "星星人IP以治愈系形象，陪伴Z世代年轻人的情感生活",
      "visual_identity": "星星、爱心、彩虹、马卡龙色系",
      "slogan": "怦然星动，温暖相伴"
    },
    
    // 核心数据
    "data": {
      "sales_volume": { "value": 2000000, "unit": "件", "label": "累计销量" },
      "monthly_sales": { "value": 80000, "unit": "件", "label": "月均销量" },
      "revenue": { "value": 138000000, "unit": "元", "label": "累计营收" },
      "conversion_rate": { "value": 8.5, "unit": "%", "label": "转化率" },
      "repurchase_rate": { "value": 45, "unit": "%", "label": "复购率" }
    },
    
    // 用户画像
    "user_persona": {
      "age": "18-30岁",
      "gender": "女性75% · 男性25%",
      "income": "月收入5000-15000元",
      "education": "大专及以上学历",
      "cities": ["上海", "北京", "广州", "深圳", "成都", "杭州"],
      "motivations": ["收藏", "情感陪伴", "社交货币", "解压治愈"],
      "price_sensitivity": "中等"
    },
    
    // 渠道策略
    "channels": {
      "online": {
        "platforms": ["天猫", "微信小程序", "抖音", "得物"],
        "share": "55%"
      },
      "offline": {
        "locations": ["泡泡玛特门店", "机器人商店", "便利店", "书店"],
        "share": "45%"
      }
    },
    
    // IP分析
    "ip_analysis": {
      "name": "星星人",
      "type": "自有IP",
      "holder": "泡泡玛特",
      "innovation_score": 8.0,
      "cultural_elements": ["星星", "爱心", "治愈", "陪伴", "梦想"]
    },
    
    // 竞品分析
    "competitors": [
      { "name": "Labubu毛绒", "brand": "泡泡玛特", "price": 89, "share": "25%", "advantage": "同品牌, 知名度高" },
      { "name": "迪士尼挂件", "brand": "迪士尼", "price": 129, "share": "20%", "advantage": "国际IP, 品牌力强" }
    ],
    
    // SWOT分析
    "swot": {
      "strengths": ["盲盒模式成熟", "IP孵化能力强", "渠道覆盖广", "用户粘性高"],
      "weaknesses": ["过度依赖盲盒", "IP生命周期短", "二手市场冲击"],
      "opportunities": ["情绪消费趋势", "出海市场拓展", "数字藏品结合"],
      "threats": ["监管政策风险", "市场竞争加剧", "消费者理性回归"]
    },
    
    // 发展建议
    "recommendations": {
      "short_term": ["推出限定款刺激消费", "加强社交媒体营销", "优化门店体验"],
      "medium_term": ["拓展海外东南亚市场", "开发动画影视内容", "建立会员体系"],
      "long_term": ["打造主题乐园", "元宇宙虚拟形象", "IP授权生态"]
    }
  }
];

// 导出数据
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TEST_CASES;
}
