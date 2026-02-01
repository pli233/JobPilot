---
name: save_jobs
description: 保存搜索到的职位到 Supabase 数据库。用于稍后跟踪。
trigger: ["保存职位", "save jobs", "收藏职位"]
allowed-tools: WebFetch, Read
---

# Save Jobs Skill

保存职位到 Supabase 数据库。

## 数据存储

- **主存储**: Supabase PostgreSQL (远程数据库)
- **API**: Dashboard API (`POST /api/jobs`)
- **查看**: Dashboard UI (http://localhost:3000/jobs)

## 输入参数

| 参数 | 说明 | 必填 |
|------|------|------|
| jobs | 职位列表 | Yes |

每个职位包含：
```json
{
  "platform": "linkedin",
  "title": "Senior Python Engineer",
  "company": "Anthropic",
  "location": "San Francisco, CA",
  "location_type": "hybrid",
  "salary_min": 180000,
  "salary_max": 220000,
  "url": "https://linkedin.com/jobs/view/123456",
  "description": "Job description...",
  "easy_apply": true,
  "match_score": 85
}
```

## 执行步骤

### Step 1: 保存职位

POST 到 API (会自动按 URL 去重)：

```
POST http://localhost:3000/api/jobs
Content-Type: application/json

{
  "platform": "linkedin",
  "title": "Senior Python Engineer",
  "company": "Anthropic",
  "location": "San Francisco, CA",
  "location_type": "hybrid",
  "salary_min": 180000,
  "salary_max": 220000,
  "url": "https://linkedin.com/jobs/view/123456",
  "easy_apply": true,
  "match_score": 85
}
```

### Step 2: 确认结果

```
GET http://localhost:3000/api/jobs
```

## 输出格式

```
## 职位已保存

**新增**: 5 个职位
**跳过**: 2 个 (已存在)

### 新保存的职位

| 公司 | 职位 | 平台 | 匹配度 |
|------|------|------|--------|
| Anthropic | Senior Python Engineer | LinkedIn | 85% |
| Stripe | Backend Engineer | Indeed | 80% |
| OpenAI | ML Engineer | Glassdoor | 78% |

---

**查看所有职位**: http://localhost:3000/jobs
```

## 管理已保存职位

### 查看职位
- Dashboard: http://localhost:3000/jobs
- API: `GET /api/jobs`

### 删除职位
- Dashboard UI 删除按钮
- API: `DELETE /api/jobs?id={id}`

## 注意事项

1. 去重基于 URL (upsert)
2. 确保 Dashboard 服务运行中
3. 匹配度帮助决定优先级
