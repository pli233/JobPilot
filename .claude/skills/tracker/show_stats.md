---
name: show_stats
description: 显示申请统计数据。包括总数、各状态数量、响应率、平台分布等。
trigger: ["显示统计", "show stats", "查看统计", "申请统计"]
allowed-tools: mcp__excel__read_data_from_excel, Read
---

# Show Stats Skill

显示申请统计数据。

## 输入参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| period | 统计周期 | "all" |

周期选项：
- "today" - 今日
- "week" - 本周
- "month" - 本月
- "all" - 全部

## 执行步骤

### Step 1: 读取申请数据

```
mcp__excel__read_data_from_excel({
  filepath: "data/job_tracker.xlsx",
  sheet_name: "Applications"
})
```

### Step 2: 计算统计指标

```python
# 按状态统计
status_counts = {
    "Applied": count(status == "Applied"),
    "Viewed": count(status == "Viewed"),
    "Phone Screen": count(status == "Phone Screen"),
    "Interview": count(status == "Interview"),
    "Offer": count(status == "Offer"),
    "Rejected": count(status == "Rejected"),
    "Withdrawn": count(status == "Withdrawn")
}

# 计算率
total = sum(status_counts.values())
response_rate = (Viewed + Phone Screen + Interview + Offer + Rejected) / total
interview_rate = (Interview + Offer) / total
offer_rate = Offer / total

# 按平台统计
platform_counts = group_by(platform)

# 按时间统计
daily_counts = group_by(date)
```

## 输出格式

```
## 申请统计报告

**统计周期**: 全部 (2025-01-01 至今)
**总申请数**: 128

---

### 申请漏斗

```
Applied     ████████████████████████████████ 128 (100%)
Viewed      ████████████████░░░░░░░░░░░░░░░░ 64 (50%)
Phone Screen ████████░░░░░░░░░░░░░░░░░░░░░░░░ 32 (25%)
Interview   ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 16 (12.5%)
Offer       █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 4 (3.1%)
```

### 关键指标

| 指标 | 值 | 说明 |
|------|------|------|
| 响应率 | 50% | 被查看或有回复 |
| 面试率 | 12.5% | 进入面试阶段 |
| Offer 率 | 3.1% | 收到 Offer |
| 平均响应时间 | 5 天 | 从申请到首次回复 |

### 状态分布

| 状态 | 数量 | 占比 |
|------|------|------|
| Applied | 48 | 37.5% |
| Viewed | 24 | 18.8% |
| Phone Screen | 16 | 12.5% |
| Interview | 12 | 9.4% |
| Offer | 4 | 3.1% |
| Rejected | 20 | 15.6% |
| Withdrawn | 4 | 3.1% |

### 平台分布

| 平台 | 申请数 | 响应率 | 面试率 |
|------|--------|--------|--------|
| LinkedIn | 65 | 55% | 15% |
| Indeed | 30 | 40% | 10% |
| Glassdoor | 15 | 47% | 13% |
| Direct | 18 | 61% | 17% |

### 时间趋势

| 周 | 申请 | 回复 | 面试 |
|----|------|------|------|
| 1/6-1/12 | 15 | 8 | 3 |
| 12/30-1/5 | 12 | 5 | 2 |
| 12/23-12/29 | 8 | 4 | 1 |
| 12/16-12/22 | 18 | 10 | 4 |

### 今日快报

- 今日申请: 3
- 今日回复: 2
- 待跟进: 5 (超过 7 天未更新)

---

**建议**:
1. LinkedIn 表现最好，继续重点使用
2. Direct 申请响应率最高，多尝试公司官网
3. 有 5 个申请超过 7 天未更新，建议跟进

运行 "status_review" 检查待跟进的申请
```

## 指标说明

### 响应率
```
响应率 = (Viewed + Phone Screen + Interview + Offer + Rejected) / Total
```
表示有多少申请收到了回复。

### 面试率
```
面试率 = (Phone Screen + Interview + Offer) / Total
```
表示有多少申请进入面试流程。

### Offer 率
```
Offer 率 = Offer / Total
```
表示最终拿到 Offer 的比例。

## 注意事项

1. 统计基于当前数据快照
2. 部分申请可能仍在处理中
3. 行业平均响应率约 10-20%
4. 行业平均面试率约 5-10%
