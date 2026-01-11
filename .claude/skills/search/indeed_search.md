---
name: indeed_search
description: 在 Indeed 上搜索职位。使用 Firecrawl MCP 抓取搜索结果。
trigger: ["indeed 搜索", "indeed search", "搜索 indeed"]
allowed-tools: mcp__firecrawl-mcp__firecrawl_search, mcp__firecrawl-mcp__firecrawl_scrape, Read
---

# Indeed Search Skill

在 Indeed 平台搜索职位。

## 输入参数

| 参数 | 说明 | 示例 |
|------|------|------|
| keywords | 搜索关键词 | "Senior Python Engineer" |
| location | 地点 (可选) | "San Francisco" |
| limit | 结果数量 (可选) | 10 |

## 执行步骤

### Step 1: 构建搜索查询

```
query = "{keywords} {location} site:indeed.com"
```

例如: "Senior Python Engineer San Francisco site:indeed.com"

### Step 2: 执行搜索

```
mcp__firecrawl-mcp__firecrawl_search({
  query: "Senior Python Engineer San Francisco site:indeed.com",
  limit: 10,
  sources: [{ type: "web" }]
})
```

### Step 3: 处理搜索结果

Firecrawl 返回搜索结果列表，提取：
- URL
- Title
- Description snippet

### Step 4: 抓取职位详情 (可选)

对于每个职位 URL，可以抓取详细内容：

```
mcp__firecrawl-mcp__firecrawl_scrape({
  url: "https://www.indeed.com/viewjob?jk=abc123",
  formats: ["markdown"],
  onlyMainContent: true
})
```

### Step 5: 提取结构化数据

从抓取的内容中提取：
- 职位名称
- 公司名称
- 地点
- 薪资范围
- 职位描述
- 要求

### Step 6: 格式化输出

```
## Indeed 搜索结果

关键词: {keywords}
地点: {location}
找到: {count} 个职位

---

### #1 Senior Python Developer
**Company**: TechCorp Inc.
**Location**: San Francisco, CA
**Salary**: $150,000 - $180,000/year
**Posted**: 3 days ago

**描述摘要**:
We are looking for an experienced Python developer...

**URL**: https://www.indeed.com/viewjob?jk=abc123

---
```

## 高级搜索

Indeed 支持高级搜索参数（通过 URL）：
- `q=` - 关键词
- `l=` - 地点
- `salary=` - 薪资范围
- `jt=fulltime` - 工作类型
- `remotejob=1` - 远程职位

## 速率限制

- Firecrawl 每小时限制: 30 次请求
- 建议每次请求间隔: 3-5 秒
- 批量抓取时使用延迟

## 注意事项

1. Indeed 页面结构可能变化，需要适配
2. 部分职位可能跳转到外部网站
3. 薪资信息不一定所有职位都有
