---
name: query_applications
description: 查询申请记录。支持按状态、公司、日期等条件筛选。
trigger: ["查询申请", "query applications", "查看申请", "申请列表"]
allowed-tools: mcp__excel__read_data_from_excel, Read
---

# Query Applications Skill

查询申请记录。

## 输入参数

| 参数 | 说明 | 示例 |
|------|------|------|
| status | 按状态筛选 | "Interview" |
| company | 按公司筛选 | "Anthropic" |
| platform | 按平台筛选 | "linkedin" |
| date_from | 开始日期 | "2025-01-01" |
| date_to | 结束日期 | "2025-01-31" |
| limit | 返回数量 | 10 |

## 执行步骤

### Step 1: 读取所有记录

```
mcp__excel__read_data_from_excel({
  filepath: "k:\\JobPilot\\data\\job_tracker.xlsx",
  sheet_name: "Applications"
})
```

### Step 2: 应用筛选条件

```python
results = all_records

if status:
    results = filter(r => r.status == status, results)

if company:
    results = filter(r => r.company.contains(company), results)

if platform:
    results = filter(r => r.platform == platform, results)

if date_from:
    results = filter(r => r.date >= date_from, results)

if date_to:
    results = filter(r => r.date <= date_to, results)
```

### Step 3: 排序

默认按日期倒序（最新的在前）。

### Step 4: 格式化输出

## 输出格式

### 无筛选 - 全部记录

```
## 申请记录

共 45 条记录

### 最近申请 (显示前 10 条)

| ID | 日期 | 公司 | 职位 | 状态 |
|----|------|------|------|------|
| APP-20250111-003 | 01-11 | Anthropic | Senior Python Engineer | Applied |
| APP-20250111-002 | 01-11 | Stripe | Backend Engineer | Applied |
| APP-20250111-001 | 01-11 | OpenAI | ML Engineer | Applied |
| APP-20250110-005 | 01-10 | Meta | Staff Engineer | Viewed |
| APP-20250110-004 | 01-10 | Google | Senior SWE | Interview |
| ... | ... | ... | ... | ... |

使用 "查询申请 status:Interview" 筛选特定状态
```

### 按状态筛选

```
## 申请记录 - Interview

筛选: status = "Interview"
共 5 条记录

| ID | 日期 | 公司 | 职位 | 备注 |
|----|------|------|------|------|
| APP-20250110-004 | 01-10 | Google | Senior SWE | 1/15 技术面 |
| APP-20250108-002 | 01-08 | Amazon | SDE II | 1/18 主管面 |
| APP-20250105-001 | 01-05 | Anthropic | ML Engineer | 1/12 已完成 |
| ... | ... | ... | ... | ... |

**提示**: 有 5 个待面试，请做好准备！
```

### 按公司筛选

```
## 申请记录 - Anthropic

筛选: company contains "Anthropic"
共 3 条记录

| ID | 日期 | 职位 | 状态 |
|----|------|------|------|
| APP-20250111-003 | 01-11 | Senior Python Engineer | Applied |
| APP-20250105-001 | 01-05 | ML Engineer | Interview |
| APP-20241220-015 | 12-20 | Backend Developer | Rejected |

**历史**: 之前申请过该公司 2 次
```

### 按日期范围筛选

```
## 申请记录 - 本周

筛选: 2025-01-06 到 2025-01-12
共 12 条记录

| 日期 | 公司 | 职位 | 状态 |
|------|------|------|------|
| 01-11 | Anthropic | Senior Python Engineer | Applied |
| 01-11 | Stripe | Backend Engineer | Applied |
| 01-10 | Meta | Staff Engineer | Viewed |
| ... | ... | ... | ... |

**本周统计**:
- 申请: 12
- 回复: 3
- 面试: 2
```

## 常用查询

| 查询 | 命令 |
|------|------|
| 所有申请 | "查询申请" |
| 待回复 | "查询申请 status:Applied" |
| 进行中 | "查询申请 status:Interview" |
| 已收 Offer | "查询申请 status:Offer" |
| 被拒 | "查询申请 status:Rejected" |
| 某公司 | "查询申请 company:Google" |
| 本周 | "查询申请 本周" |
| 本月 | "查询申请 本月" |

## 注意事项

1. 默认显示最近 10 条
2. 可以组合多个筛选条件
3. 日期支持相对表达（本周、本月）
4. 公司名支持模糊匹配
