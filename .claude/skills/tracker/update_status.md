---
name: update_status
description: 更新申请记录的状态。当收到面试邀请、Offer 或拒信时调用。
trigger: ["更新状态", "update status", "更新申请", "修改状态"]
allowed-tools: WebFetch, AskUserQuestion
---

# Update Status Skill

更新申请记录的状态。

## 数据存储

- **主存储**: Supabase PostgreSQL (远程数据库)
- **API**: Dashboard API (`PATCH /api/applications`)
- **查看**: Dashboard UI (http://localhost:3000/applications)

## 输入参数

| 参数 | 说明 | 必填 |
|------|------|------|
| identifier | 公司名、职位名或申请 ID | Yes |
| newStatus | 新状态 | Yes |
| notes | 备注 (可选) | No |

## 状态流转

```
applied → oa → interview → offer
    ↘ rejected    ↘ rejected
                       ↘ rejected
```

## 有效状态值

| 状态 | 说明 |
|------|------|
| applied | 已提交 |
| oa | Online Assessment |
| interview | 面试中 |
| offer | 收到 Offer |
| rejected | 被拒绝 |
| withdrawn | 已撤回 |

## 执行步骤

### Step 1: 查询申请记录

```
GET http://localhost:3000/api/applications
```

### Step 2: 查找目标记录

搜索匹配的记录：
- 按 ID 精确匹配
- 按公司名模糊匹配
- 按职位名匹配

如果多条匹配，使用 AskUserQuestion 确认。

### Step 3: 更新状态

```
PATCH http://localhost:3000/api/applications
Content-Type: application/json

{
  "id": "abc123-uuid",
  "status": "interview",
  "notes": "1月20日下午3点电话面试"
}
```

### Step 4: 确认更新

```
GET http://localhost:3000/api/applications
```

## 输出格式

```
## 状态已更新

**公司**: Anthropic
**职位**: Senior Python Engineer

**状态变更**:
- 旧状态: Applied
- 新状态: Interview
- 更新时间: 2025-01-28

**备注**: 1月20日下午3点电话面试

---

**查看详情**: http://localhost:3000/applications
```

## 快捷更新

常见更新场景：

### 收到面试邀请
```
用户: 更新 Anthropic 到 interview
```

### 收到 OA
```
用户: Stripe 发了 OA
→ 自动识别并更新为 oa
```

### 收到拒信
```
用户: Stripe 拒了
→ 自动识别并更新为 rejected
```

### 收到 Offer
```
用户: Google 给 offer 了
→ 更新为 offer
```

## 注意事项

1. 确保 Dashboard 服务运行中
2. 建议添加备注说明原因
3. 及时更新有助于统计分析
4. 使用 Dashboard Kanban 视图可以拖拽更新状态
