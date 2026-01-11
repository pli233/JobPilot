---
name: set_preferences
description: 设置求职偏好：搜索关键词、薪资期望、公司偏好、申请设置等。更新 preferences.json。
trigger: ["设置求职偏好", "set preferences", "修改偏好", "搜索设置"]
allowed-tools: Read, Write, AskUserQuestion
---

# Set Preferences Skill

设置和更新求职偏好。

## 配置文件

- **求职偏好**: `k:\JobPilot\config\preferences.json`
- **个人档案**: `k:\JobPilot\config\profile.json` (另见 set_profile)

## Preferences 结构

### 1. 职位搜索 (job_search)

| 字段 | 说明 | 示例 |
|------|------|------|
| keywords | 搜索关键词 | ["Software Engineer", "Backend", "Python"] |
| titles | 目标职位 | ["Senior Software Engineer", "Staff Engineer"] |
| locations | 目标地点 | ["San Francisco", "Remote"] |
| remote_preference | 远程偏好 | "remote" / "hybrid" / "onsite" / "any" |
| job_types | 工作类型 | ["Full-time", "Contract"] |
| experience_levels | 经验级别 | ["Mid-Senior level", "Senior"] |

### 2. 薪资期望 (salary)

| 字段 | 说明 | 示例 |
|------|------|------|
| minimum | 最低薪资 | 150000 |
| maximum | 最高薪资 | null (不限) |
| currency | 货币 | "USD" |
| period | 周期 | "yearly" / "monthly" / "hourly" |
| include_equity | 包含股权 | true |
| negotiable | 可协商 | true |

### 3. 公司偏好 (companies)

| 字段 | 说明 | 示例 |
|------|------|------|
| preferred | 优先公司 | ["Google", "Meta", "Anthropic"] |
| excluded | 排除公司 | ["Staffing Agency", "Recruiting Firm"] |
| blacklist_reasons | 排除原因 | {"Company X": "Bad reviews"} |

### 4. 申请设置 (application)

| 字段 | 说明 | 默认值 |
|------|------|--------|
| auto_submit | 自动提交 (危险) | false |
| require_confirmation | 需要确认 | true |
| save_screenshots | 保存截图 | true |
| daily_limit | 每日上限 | 20 |
| min_match_score | 最低匹配分 | 60 |
| skip_easy_apply_only | 跳过纯 Easy Apply | false |
| preferred_platforms | 优先平台 | ["LinkedIn", "Company Website"] |

### 5. 过滤设置 (filters)

| 字段 | 说明 | 默认值 |
|------|------|--------|
| posted_within_days | 发布天数内 | 7 |
| exclude_staffing | 排除猎头 | true |
| require_salary_info | 需要薪资信息 | false |
| exclude_keywords | 排除关键词 | ["intern", "junior"] |

## 执行步骤

### Step 1: 读取当前偏好

```
Read k:\JobPilot\config\preferences.json
```

### Step 2: 询问要修改的部分

使用 AskUserQuestion 提供选项：
- 修改搜索关键词和地点
- 修改薪资期望
- 修改公司偏好
- 修改申请设置
- 修改过滤条件
- 查看当前偏好

### Step 3: 收集新值

根据选择，询问具体字段的新值。

### Step 4: 更新偏好文件

使用 Write 工具更新 preferences.json。

## 输出格式

```
## 求职偏好已更新

修改的字段:
- salary.minimum: 100000 → 150000
- job_search.remote_preference: any → remote

当前偏好摘要:
- 搜索关键词: Software Engineer, Backend, Python
- 目标地点: San Francisco, Remote
- 远程偏好: remote
- 薪资期望: $150,000+
- 排除公司: Staffing Agency
- 每日申请上限: 20
- 最低匹配分: 60
```

## 常见设置场景

### 设置远程优先
```json
{
  "job_search": {
    "remote_preference": "remote",
    "locations": ["Remote", "San Francisco"]
  }
}
```

### 设置高薪期望
```json
{
  "salary": {
    "minimum": 200000,
    "include_equity": true,
    "negotiable": true
  }
}
```

### 排除猎头公司
```json
{
  "companies": {
    "excluded": ["Staffing Agency", "Recruiting Firm", "Talent Solutions"]
  },
  "filters": {
    "exclude_staffing": true
  }
}
```

## 注意事项

1. 关键词设置会影响搜索结果质量
2. 薪资期望过高可能减少匹配职位数
3. 过滤条件太严格可能错过好机会
4. 建议先宽松搜索，再逐步细化
