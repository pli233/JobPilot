---
name: save_jobs
description: 保存搜索到的职位到 Saved Jobs 工作表。用于稍后申请或跟踪。
trigger: ["保存职位", "save jobs", "收藏职位"]
allowed-tools: mcp__excel__read_data_from_excel, mcp__excel__write_data_to_excel, Read
---

# Save Jobs Skill

保存职位到 Saved Jobs 工作表。

## 输入参数

| 参数 | 说明 | 必填 |
|------|------|------|
| jobs | 职位列表 | Yes |

每个职位包含：
```json
{
  "id": "linkedin_123456",
  "platform": "linkedin",
  "company": "Anthropic",
  "position": "Senior Python Engineer",
  "location": "San Francisco, CA",
  "salary": "$180K - $220K",
  "easy_apply": true,
  "match_score": 85
}
```

## Excel 表结构

**工作表**: Saved Jobs

| 列 | 字段 | 说明 |
|----|------|------|
| A | ID | 平台职位 ID |
| B | Platform | 来源平台 |
| C | Company | 公司名称 |
| D | Position | 职位名称 |
| E | Location | 地点 |
| F | Salary | 薪资范围 |
| G | Easy Apply | 是否一键申请 |
| H | Match Score | 匹配度 |
| I | Saved At | 保存时间 |
| J | Applied | 是否已申请 |

## 执行步骤

### Step 1: 读取现有保存记录

```
mcp__excel__read_data_from_excel({
  filepath: "k:\\JobPilot\\data\\job_tracker.xlsx",
  sheet_name: "Saved Jobs"
})
```

### Step 2: 去重检查

检查新职位是否已保存：
- 比较 ID + Platform 组合
- 跳过已存在的职位

### Step 3: 准备数据

```json
[
  ["linkedin_123456", "linkedin", "Anthropic", "Senior Python Engineer",
   "San Francisco, CA", "$180K-$220K", "Yes", "85",
   "2025-01-11 10:30:00", "No"],
  ["indeed_789012", "indeed", "Stripe", "Backend Engineer",
   "Remote", "$170K-$200K", "No", "80",
   "2025-01-11 10:30:00", "No"]
]
```

### Step 4: 批量写入

```
mcp__excel__write_data_to_excel({
  filepath: "k:\\JobPilot\\data\\job_tracker.xlsx",
  sheet_name: "Saved Jobs",
  data: [[...jobs_data]],
  start_cell: "A{next_row}"
})
```

## 输出格式

```
## 职位已保存

**新增**: 5 个职位
**跳过**: 2 个 (已存在)
**失败**: 0 个

### 新保存的职位

| 公司 | 职位 | 平台 | 匹配度 |
|------|------|------|--------|
| Anthropic | Senior Python Engineer | LinkedIn | 85% |
| Stripe | Backend Engineer | Indeed | 80% |
| OpenAI | ML Engineer | Glassdoor | 78% |
| Meta | Staff Engineer | LinkedIn | 75% |
| Google | Senior SWE | LinkedIn | 72% |

### 跳过的职位 (已存在)

| 公司 | 职位 | 保存于 |
|------|------|--------|
| Netflix | Backend Dev | 2025-01-10 |
| Apple | iOS Engineer | 2025-01-09 |

---

**Saved Jobs 总数**: 45
**已申请**: 12
**待申请**: 33
```

## 批量保存

搜索结束后批量保存所有结果：

```
// 从 search_all_platforms 返回的结果
jobs = [
  { company: "Anthropic", position: "...", ... },
  { company: "Stripe", position: "...", ... },
  ...
]

// 调用 save_jobs 批量保存
save_jobs({ jobs: jobs })
```

## 管理已保存职位

### 标记已申请
当申请某个保存的职位后，更新 Applied 字段：
```
Saved Jobs[ID].Applied = "Yes"
```

### 删除过期职位
职位可能下架，定期清理：
- 保存超过 30 天未申请
- 职位链接已失效

## 注意事项

1. 去重基于 ID + Platform
2. 保存时间戳用于排序和清理
3. 匹配度帮助决定申请优先级
4. Easy Apply 的职位可以快速申请
