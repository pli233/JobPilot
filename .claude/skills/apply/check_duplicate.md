---
name: check_duplicate
description: 检查是否已申请过某个职位。防止重复申请，避免给招聘方留下不好印象。
trigger: ["检查重复", "check duplicate", "是否已申请"]
allowed-tools: mcp__excel__read_data_from_excel, Read
---

# Check Duplicate Skill

检查是否已申请过某个职位。

## 输入参数

| 参数 | 说明 | 示例 |
|------|------|------|
| company | 公司名称 | "Anthropic" |
| position | 职位名称 (可选) | "Senior Python Engineer" |
| url | 职位 URL (可选) | "https://..." |

## 执行步骤

### Step 1: 读取申请记录

```
mcp__excel__read_data_from_excel({
  filepath: "data/job_tracker.xlsx",
  sheet_name: "Applications"
})
```

### Step 2: 检查匹配

检查以下条件：

1. **完全匹配 URL**
   - 如果提供了 URL，检查是否有完全相同的 URL

2. **公司 + 职位匹配**
   - 相同公司名称（忽略大小写）
   - 相似职位名称（模糊匹配）

3. **时间窗口**
   - 即使职位不同，同一公司 30 天内申请多次可能不好

### Step 3: 返回结果

## 输出格式

### 未申请过
```
## 重复检查结果

公司: Anthropic
职位: Senior Python Engineer

**结果**: 未申请过此职位 ✓

可以安全提交申请。
```

### 已申请过
```
## 重复检查结果

公司: Anthropic
职位: Senior Python Engineer

**结果**: 已申请过此职位 ⚠️

**历史记录**:
| ID | 日期 | 职位 | 状态 |
|----|------|------|------|
| APP-20250105-003 | 2025-01-05 | Senior Python Engineer | Applied |

**距上次申请**: 6 天

**建议**:
- 不要重复申请同一职位
- 如有更新，可考虑跟进之前的申请
- 等待 30 天后可申请该公司其他职位
```

### 同公司其他职位
```
## 重复检查结果

公司: Anthropic
职位: Backend Engineer

**结果**: 未申请过此具体职位 ✓

**注意**: 同公司有其他申请记录

**历史记录**:
| ID | 日期 | 职位 | 状态 |
|----|------|------|------|
| APP-20250105-003 | 2025-01-05 | Senior Python Engineer | Interview |

**建议**:
- 可以申请，但建议在面试中说明
- 或等待当前申请有结果后再申请
```

## 匹配规则

### 职位名称匹配
使用模糊匹配，以下视为相同职位：
- "Senior Python Engineer" ≈ "Sr. Python Engineer"
- "Backend Developer" ≈ "Backend Engineer"
- "Software Engineer, Backend" ≈ "Backend Software Engineer"

### 公司名称匹配
忽略：
- 大小写差异
- Inc., LLC, Corp. 等后缀
- 空格差异

### 时间考虑
| 距上次申请 | 建议 |
|------------|------|
| < 7 天 | 不要重复申请 |
| 7-30 天 | 谨慎，可能被认为过于急切 |
| 30-90 天 | 可以申请其他职位 |
| > 90 天 | 可以重新申请 |

## 注意事项

1. 重复申请可能影响形象
2. 部分公司 ATS 会自动识别重复申请
3. 如果之前被拒，等待至少 6 个月
4. 面试中的职位，不要申请同公司其他职位
