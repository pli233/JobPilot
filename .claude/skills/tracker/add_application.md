---
name: add_application
description: 记录新的申请到 Excel 追踪表。在成功提交申请后调用。
trigger: ["记录申请", "add application", "添加申请记录"]
allowed-tools: mcp__excel__read_data_from_excel, mcp__excel__write_data_to_excel, Read
---

# Add Application Skill

记录新申请到追踪表。

## 输入参数

| 参数 | 说明 | 必填 |
|------|------|------|
| company | 公司名称 | Yes |
| position | 职位名称 | Yes |
| platform | 申请平台 | Yes |
| url | 职位 URL | No |
| status | 初始状态 | No (默认 "Applied") |
| match_score | 匹配度 | No |
| resume | 使用的简历 | No |
| notes | 备注 | No |

## Excel 表结构

**工作表**: Applications

| 列 | 字段 | 说明 |
|----|------|------|
| A | ID | APP-YYYYMMDD-NNN |
| B | Date | 申请日期 |
| C | Platform | 申请平台 |
| D | Company | 公司名称 |
| E | Position | 职位名称 |
| F | Location | 地点 |
| G | Status | 申请状态 |
| H | Match Score | 匹配度 (0-100) |
| I | Resume | 使用的简历文件名 |
| J | URL | 职位链接 |
| K | Notes | 备注 |

## 执行步骤

### Step 1: 读取现有记录

```
mcp__excel__read_data_from_excel({
  filepath: "k:\\JobPilot\\data\\job_tracker.xlsx",
  sheet_name: "Applications"
})
```

确定下一行位置和 ID 编号。

### Step 2: 生成申请 ID

格式: `APP-YYYYMMDD-NNN`

```
今日日期: 2025-01-11
今日已有申请: 2
新 ID: APP-20250111-003
```

### Step 3: 准备数据

```json
[
  "APP-20250111-003",
  "2025-01-11",
  "linkedin",
  "Anthropic",
  "Senior Python Engineer",
  "San Francisco, CA",
  "Applied",
  "85",
  "resume_main.pdf",
  "https://linkedin.com/jobs/view/123456",
  "Via Easy Apply"
]
```

### Step 4: 写入 Excel

```
mcp__excel__write_data_to_excel({
  filepath: "k:\\JobPilot\\data\\job_tracker.xlsx",
  sheet_name: "Applications",
  data: [[...data]],
  start_cell: "A{next_row}"
})
```

## 输出格式

```
## 申请已记录

**ID**: APP-20250111-003
**公司**: Anthropic
**职位**: Senior Python Engineer
**平台**: LinkedIn
**状态**: Applied
**日期**: 2025-01-11

---

**今日申请统计**:
- 今日申请: 3
- 每日限制: 20
- 剩余配额: 17

**总体统计**:
- 本周申请: 12
- 本月申请: 45
- 总申请数: 128
```

## 状态值

| 状态 | 说明 |
|------|------|
| Applied | 已提交申请 |
| Viewed | 申请被查看 |
| Phone Screen | 电话面试 |
| Interview | 正式面试 |
| Offer | 收到 Offer |
| Rejected | 被拒绝 |
| Withdrawn | 主动撤回 |

## 平台值

| 平台 | 说明 |
|------|------|
| linkedin | LinkedIn |
| indeed | Indeed |
| glassdoor | Glassdoor |
| greenhouse | Greenhouse ATS |
| lever | Lever ATS |
| workday | Workday ATS |
| direct | 公司官网直接申请 |
| referral | 内推 |
| other | 其他 |

## 注意事项

1. ID 必须唯一
2. 日期使用 YYYY-MM-DD 格式
3. 建议填写所有字段
4. 及时更新状态
