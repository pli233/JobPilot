---
name: get_job_details
description: 获取单个职位的详细信息。支持 LinkedIn 和其他平台。
trigger: ["职位详情", "job details", "获取详情", "查看职位"]
allowed-tools: mcp__linkedin__get_job_details, mcp__firecrawl-mcp__firecrawl_scrape, Read
---

# Get Job Details Skill

获取职位的完整详细信息。

## 输入参数

| 参数 | 说明 | 示例 |
|------|------|------|
| job_id | LinkedIn 职位 ID | "4252026496" |
| url | 职位页面 URL | "https://..." |

提供 job_id 或 url 其中之一。

## 执行步骤

### LinkedIn 职位

如果提供 job_id 或 LinkedIn URL：

```
mcp__linkedin__get_job_details({
  job_id: "4252026496"
})
```

返回内容：
- 职位名称
- 公司名称
- 地点
- 发布日期
- 申请人数
- 职位描述（完整）
- 要求列表
- 福利

### 其他平台职位

如果提供非 LinkedIn URL：

```
mcp__firecrawl-mcp__firecrawl_scrape({
  url: "{job_url}",
  formats: ["markdown"],
  onlyMainContent: true
})
```

### 输出格式

```
## 职位详情

### Senior Python Engineer
**Company**: Anthropic
**Location**: San Francisco, CA (Remote friendly)
**Posted**: 5 days ago
**Applicants**: 200+ applicants

---

### 职位描述

We are looking for a Senior Python Engineer to join our safety team.
You will work on building reliable and scalable systems...

### 要求

- 5+ years of Python experience
- Experience with distributed systems
- Strong communication skills
- Bachelor's degree in CS or related field

### 福利

- Competitive salary ($180K - $250K)
- Equity package
- Health, dental, vision insurance
- Unlimited PTO
- Remote work option

### 申请方式

**Easy Apply**: Yes
**URL**: https://www.linkedin.com/jobs/view/4252026496

---

**匹配度分析**:
运行 calculate_match 可获取简历匹配度评估。
```

## 提取关键信息

自动提取以下结构化信息：
- salary_range: 薪资范围
- experience_required: 要求年限
- skills: 技能要求列表
- education: 学历要求
- benefits: 福利列表
- application_deadline: 申请截止日期

## 保存职位

获取详情后可以保存到 Saved Jobs：
- 调用 tracker/save_jobs skill
- 或直接写入 Excel

## 注意事项

1. 职位详情可能随时变化
2. 部分公司不公开薪资信息
3. LinkedIn 详情更结构化
4. 其他平台需要解析 HTML/Markdown
