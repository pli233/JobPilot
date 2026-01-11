---
name: glassdoor_search
description: 在 Glassdoor 上搜索职位。使用 Firecrawl MCP 抓取搜索结果，同时可获取公司评价信息。
trigger: ["glassdoor 搜索", "glassdoor search", "搜索 glassdoor"]
allowed-tools: mcp__firecrawl-mcp__firecrawl_search, mcp__firecrawl-mcp__firecrawl_scrape, Read
---

# Glassdoor Search Skill

在 Glassdoor 平台搜索职位。

## 输入参数

| 参数 | 说明 | 示例 |
|------|------|------|
| keywords | 搜索关键词 | "Senior Python Engineer" |
| location | 地点 (可选) | "San Francisco" |
| limit | 结果数量 (可选) | 10 |

## 执行步骤

### Step 1: 构建搜索查询

```
query = "{keywords} {location} site:glassdoor.com/job"
```

例如: "Senior Python Engineer San Francisco site:glassdoor.com/job"

### Step 2: 执行搜索

```
mcp__firecrawl-mcp__firecrawl_search({
  query: "Senior Python Engineer San Francisco site:glassdoor.com/job",
  limit: 10,
  sources: [{ type: "web" }]
})
```

### Step 3: 抓取职位详情

对于每个职位 URL：

```
mcp__firecrawl-mcp__firecrawl_scrape({
  url: "https://www.glassdoor.com/job-listing/...",
  formats: ["markdown"],
  onlyMainContent: true
})
```

### Step 4: 提取结构化数据

从抓取内容提取：
- 职位名称
- 公司名称
- 公司评分 (Glassdoor 特有)
- 地点
- 薪资估算
- 职位描述

### Step 5: 格式化输出

```
## Glassdoor 搜索结果

关键词: {keywords}
地点: {location}
找到: {count} 个职位

---

### #1 Senior Software Engineer
**Company**: Stripe
**Rating**: 4.2/5.0 (1,234 reviews)
**Location**: San Francisco, CA (Hybrid)
**Salary Estimate**: $170K - $220K (Glassdoor est.)

**描述摘要**:
Join our engineering team to build payment infrastructure...

**URL**: https://www.glassdoor.com/job-listing/...

---
```

## Glassdoor 特有信息

Glassdoor 提供额外信息：
- 公司评分和评价数量
- 薪资估算（即使职位未标明）
- 面试难度
- 面试问题
- CEO 支持率

### 获取公司详情

```
mcp__firecrawl-mcp__firecrawl_scrape({
  url: "https://www.glassdoor.com/Overview/Working-at-{company}",
  formats: ["markdown"]
})
```

## 速率限制

- Firecrawl 每小时限制: 30 次请求
- Glassdoor 可能有反爬虫保护
- 建议间隔: 5-10 秒

## 注意事项

1. Glassdoor 登录后内容更完整
2. 部分内容可能需要处理登录弹窗
3. 薪资估算仅供参考
4. 公司评分可帮助筛选
