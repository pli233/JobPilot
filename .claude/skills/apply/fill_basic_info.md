---
name: fill_basic_info
description: 填写申请表单的基本信息字段，包括姓名、邮箱、电话、地址、LinkedIn 等。
trigger: ["填写基本信息", "fill basic info", "填写个人信息"]
allowed-tools: mcp__chrome-devtools__fill_form, mcp__chrome-devtools__fill, mcp__chrome-devtools__take_snapshot, Read
---

# Fill Basic Info Skill

填写表单中的基本信息字段。

## 前置条件

- 已分析表单结构 (analyze_form)
- 已获取页面快照（有元素 uid）
- profile.json 中有个人信息

## 数据来源

```
config/profile.json
```

## 执行步骤

### Step 1: 读取个人档案

```
Read config/profile.json
```

提取相关信息：
```json
{
  "personal_info": {
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "+1-555-123-4567",
    "address": {
      "street": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "zip_code": "94102",
      "country": "United States"
    }
  },
  "online_presence": {
    "linkedin_url": "https://linkedin.com/in/johndoe",
    "github_url": "https://github.com/johndoe",
    "portfolio_url": "https://johndoe.dev"
  },
  "work_experience": [
    {
      "company": "TechCorp",
      "title": "Senior Software Engineer",
      "is_current": true
    }
  ]
}
```

### Step 2: 构建填写映射

根据 analyze_form 的结果，映射字段：

| 表单字段标签 | Profile 路径 |
|--------------|--------------|
| First Name | personal_info.first_name |
| Last Name | personal_info.last_name |
| Full Name | personal_info.full_name |
| Email | personal_info.email |
| Phone | personal_info.phone |
| Street Address | personal_info.address.street |
| City | personal_info.address.city |
| State | personal_info.address.state |
| Zip Code | personal_info.address.zip_code |
| Country | personal_info.address.country |
| LinkedIn | online_presence.linkedin_url |
| GitHub | online_presence.github_url |
| Portfolio | online_presence.portfolio_url |
| Current Company | work_experience[0].company (is_current=true) |
| Current Title | work_experience[0].title (is_current=true) |

### Step 3: 批量填写

使用 `fill_form` 批量填写多个字段：

```
mcp__chrome-devtools__fill_form({
  elements: [
    { uid: "e1", value: "John" },
    { uid: "e2", value: "Doe" },
    { uid: "e3", value: "john@example.com" },
    { uid: "e4", value: "+1-555-123-4567" },
    { uid: "e5", value: "San Francisco" },
    { uid: "e6", value: "CA" },
    { uid: "e7", value: "https://linkedin.com/in/johndoe" }
  ]
})
```

### Step 4: 验证填写结果

重新获取快照，检查字段是否正确填写：

```
mcp__chrome-devtools__take_snapshot({})
```

## 字段映射表

| 字段类型 | 常见标签 | Profile 路径 |
|----------|----------|--------------|
| 名 | First Name, Given Name | personal_info.first_name |
| 姓 | Last Name, Family Name, Surname | personal_info.last_name |
| 全名 | Full Name, Name | personal_info.full_name |
| 邮箱 | Email, Email Address | personal_info.email |
| 电话 | Phone, Phone Number, Mobile | personal_info.phone |
| 街道 | Street, Address, Street Address | personal_info.address.street |
| 城市 | City | personal_info.address.city |
| 州/省 | State, Province | personal_info.address.state |
| 邮编 | Zip, Zip Code, Postal Code | personal_info.address.zip_code |
| 国家 | Country | personal_info.address.country |
| LinkedIn | LinkedIn, LinkedIn URL | online_presence.linkedin_url |
| GitHub | GitHub, GitHub URL | online_presence.github_url |
| 作品集 | Portfolio, Website, Personal Site | online_presence.portfolio_url |
| 当前公司 | Current Company, Employer | work_experience[current].company |
| 当前职位 | Current Title, Job Title | work_experience[current].title |

## 输出格式

```
## 基本信息已填写

| 字段 | 值 | 状态 |
|------|------|------|
| First Name | John | ✓ |
| Last Name | Doe | ✓ |
| Email | john@example.com | ✓ |
| Phone | +1-555-123-4567 | ✓ |
| City | San Francisco | ✓ |
| State | CA | ✓ |
| LinkedIn | https://linkedin.com/in/johndoe | ✓ |

**填写字段数**: 7/7
**跳过字段数**: 0
**错误字段数**: 0

**下一步**: 运行 upload_resume 上传简历
```

## 特殊情况处理

### 电话格式
不同表单可能要求不同格式：
- +1-555-123-4567 (国际格式)
- (555) 123-4567 (美国格式)
- 5551234567 (纯数字)

自动检测并适配，或提示用户。

### 地址字段
可能是多个字段或单一字段：

**多字段**:
- Street: 123 Main St
- City: San Francisco
- State: CA
- Zip: 94102

**单字段**:
- Address: 123 Main St, San Francisco, CA 94102

### 全名 vs 分开的名字
有些表单只有一个 Full Name 字段：
```
value = personal_info.full_name
// 或 first_name + " " + last_name
```

### 下拉选择
对于 State、Country 等下拉框：
```
mcp__chrome-devtools__fill({
  uid: "state-select",
  value: "California"  // 或 "CA"
})
```

## 注意事项

1. 填写前确保 uid 有效（页面未刷新）
2. 某些字段可能有格式验证
3. 必填字段必须填写
4. 填写后可能触发新字段出现（动态表单）
5. 下拉框选项值可能与显示文本不同
