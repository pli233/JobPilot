---
name: linkedin_search
description: 在 LinkedIn 上搜索职位。使用 LinkedIn MCP 工具进行精准搜索。
trigger: ["linkedin 搜索", "linkedin search", "搜索 linkedin"]
allowed-tools: mcp__linkedin__search_jobs, mcp__linkedin__get_job_details, Read
---

# LinkedIn Search Skill

在 LinkedIn 平台搜索职位。

## 输入参数

| 参数 | 说明 | 示例 |
|------|------|------|
| keywords | 搜索关键词 | "Senior Python Engineer" |
| location | 地点 (可选) | "San Francisco" |
| limit | 结果数量 (可选) | 10 |

## 执行步骤

### Step 1: 准备搜索词

将关键词和地点组合为搜索字符串：
```
search_term = "{keywords} {location}"
```

如果未提供，从 preferences.json 读取默认值。

### Step 2: 执行搜索

```
mcp__linkedin__search_jobs({
  search_term: "Senior Python Engineer San Francisco"
})
```

### Step 3: 处理结果

LinkedIn 返回结果包含：
- job_id: 职位 ID
- title: 职位名称
- company: 公司名称
- location: 地点
- posted_date: 发布日期
- easy_apply: 是否支持一键申请

### Step 4: 格式化输出

```
## LinkedIn 搜索结果

关键词: {keywords}
地点: {location}
找到: {count} 个职位

---

### #1 Senior Python Engineer
**Company**: Anthropic
**Location**: San Francisco, CA (Remote)
**Posted**: 2 days ago
**Easy Apply**: Yes

**Job ID**: 4252026496
**URL**: https://www.linkedin.com/jobs/view/4252026496

---

### #2 Backend Engineer - Python
...
```

## 获取详细信息

对于感兴趣的职位，可以获取详情：

```
mcp__linkedin__get_job_details({
  job_id: "4252026496"
})
```

返回完整的职位描述、要求、福利等信息。

## 速率限制

- LinkedIn 每日搜索限制: 25 次
- 建议每次搜索间隔: 5 秒
- 超出限制可能导致账号受限

## 注意事项

1. LinkedIn Cookie 有效期 1-2 周，需定期更新
2. 搜索结果按相关性排序
3. Easy Apply 职位可以使用自动申请功能
