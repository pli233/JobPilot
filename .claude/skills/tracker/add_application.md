---
name: add_application
description: 记录新的申请到 Supabase 数据库。手动记录申请后调用。
trigger: ["记录申请", "add application", "添加申请记录"]
allowed-tools: WebFetch, Read
---

# Add Application Skill

记录新申请到 Supabase 数据库。

## 数据存储

- **主存储**: Supabase PostgreSQL (远程数据库)
- **API**: Dashboard API (`POST /api/applications`)
- **查看**: Dashboard UI (http://localhost:3000/applications)

## 输入参数

| 参数 | 说明 | 必填 |
|------|------|------|
| company | 公司名称 | Yes |
| position | 职位名称 | Yes |
| platform | 申请平台 | No |
| url | 职位/申请 URL | No |
| status | 初始状态 | No (默认 "applied") |
| notes | 备注 | No |
| location | 地点 | No |
| salaryMin | 最低薪资 | No |
| salaryMax | 最高薪资 | No |

## 执行步骤

### Step 1: 创建申请记录

直接创建申请记录（可以不关联 job）：

```
POST http://localhost:3000/api/applications
Content-Type: application/json

{
  "company": "Anthropic",
  "position": "Senior Python Engineer",
  "status": "applied",
  "platform": "linkedin",
  "application_url": "https://linkedin.com/jobs/view/123456",
  "location": "San Francisco, CA",
  "salary_min": 180000,
  "salary_max": 220000,
  "notes": "投递于 LinkedIn"
}
```

### Step 2: 确认记录

验证申请已保存：

```
GET http://localhost:3000/api/applications
```

## 输出格式

```
## 申请已记录

**公司**: Anthropic
**职位**: Senior Python Engineer
**平台**: LinkedIn
**状态**: Applied
**日期**: 2025-01-28

---

**查看详情**: http://localhost:3000/applications
```

## 状态值

| 状态 | 说明 |
|------|------|
| applied | 已提交申请 |
| oa | Online Assessment |
| interview | 面试中 |
| offer | 收到 Offer |
| rejected | 被拒绝 |
| withdrawn | 已撤回 |

## 平台值

| 平台 | 说明 |
|------|------|
| linkedin | LinkedIn |
| indeed | Indeed |
| glassdoor | Glassdoor |
| greenhouse | Greenhouse ATS |
| lever | Lever ATS |
| ashby | Ashby ATS |
| workday | Workday ATS |
| direct | 公司官网 |
| referral | 内推 |
| other | 其他 |

## 注意事项

1. 使用 Dashboard API 操作数据
2. 确保 Dashboard 服务运行中 (`cd dashboard && npm run dev`)
3. 申请可以独立于 job 存在，直接提供 company 和 position
