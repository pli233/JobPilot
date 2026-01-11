---
name: update_status
description: 更新申请记录的状态。当收到面试邀请、Offer 或拒信时调用。
trigger: ["更新状态", "update status", "更新申请", "修改状态"]
allowed-tools: mcp__excel__read_data_from_excel, mcp__excel__write_data_to_excel, AskUserQuestion
---

# Update Status Skill

更新申请记录的状态。

## 输入参数

| 参数 | 说明 | 必填 |
|------|------|------|
| identifier | 公司名、职位名或申请 ID | Yes |
| new_status | 新状态 | Yes |
| notes | 备注 (可选) | No |

## 状态流转

```
Applied → Viewed → Phone Screen → Interview → Offer
                                           ↘ Rejected
                        ↘ Rejected
           ↘ Rejected

Any State → Withdrawn (主动撤回)
```

## 有效状态值

| 状态 | 说明 | 典型耗时 |
|------|------|----------|
| Applied | 已提交 | - |
| Viewed | 已被查看 | 1-3 天 |
| Phone Screen | 电话面试 | 1-2 周 |
| Interview | 正式面试 | 2-4 周 |
| Offer | 收到 Offer | 1-2 周 |
| Rejected | 被拒绝 | 任意时间 |
| Withdrawn | 主动撤回 | - |

## 执行步骤

### Step 1: 读取申请记录

```
mcp__excel__read_data_from_excel({
  filepath: "data/job_tracker.xlsx",
  sheet_name: "Applications"
})
```

### Step 2: 查找目标记录

搜索匹配的记录：
- 按 ID 精确匹配: "APP-20250111-003"
- 按公司名模糊匹配: "Anthropic"
- 按职位名匹配: "Senior Python Engineer"

如果多条匹配，使用 AskUserQuestion 确认：

```
找到多条匹配记录:

1. APP-20250111-003 | Anthropic | Senior Python Engineer | Applied
2. APP-20250105-001 | Anthropic | ML Engineer | Interview

请选择要更新的记录：
[1] [2] [取消]
```

### Step 3: 确定行号和当前状态

找到记录后：
- row_number: Excel 行号
- current_status: 当前状态

### Step 4: 更新状态

```
mcp__excel__write_data_to_excel({
  filepath: "data/job_tracker.xlsx",
  sheet_name: "Applications",
  data: [["{new_status}"]],
  start_cell: "G{row_number}"
})
```

### Step 5: 添加备注 (可选)

如果提供了备注：

```
mcp__excel__write_data_to_excel({
  filepath: "data/job_tracker.xlsx",
  sheet_name: "Applications",
  data: [["{notes}"]],
  start_cell: "K{row_number}"
})
```

## 输出格式

```
## 状态已更新

**ID**: APP-20250111-003
**公司**: Anthropic
**职位**: Senior Python Engineer

**状态变更**:
- 旧状态: Applied
- 新状态: Phone Screen
- 更新时间: 2025-01-15 14:30:00

**备注**: 1月20日下午3点电话面试

---

**申请进度**:
Applied (01-11) → Phone Screen (01-15) → ?

**下一步**:
- 准备电话面试
- 研究公司背景
- 准备常见问题
```

## 快捷更新

常见更新场景：

### 收到面试邀请
```
用户: 更新 Anthropic 到 Phone Screen
```

### 收到拒信
```
用户: Stripe 拒了
→ 自动识别并更新为 Rejected
```

### 收到 Offer
```
用户: Google 给 offer 了
→ 更新为 Offer
```

### 主动撤回
```
用户: 撤回 Meta 的申请
→ 更新为 Withdrawn
```

## 注意事项

1. 状态变更不可撤销（需手动改回）
2. 建议添加备注说明原因
3. 及时更新有助于统计分析
4. Offer/Rejected 是终态
