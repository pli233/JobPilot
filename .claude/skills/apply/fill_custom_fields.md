---
name: fill_custom_fields
description: 填写申请表单的自定义字段，如下拉选择、单选框、工作授权等标准化问题。
trigger: ["填写自定义字段", "fill custom fields", "填写选择题"]
allowed-tools: mcp__chrome-devtools__fill_form, mcp__chrome-devtools__fill, mcp__chrome-devtools__click, mcp__chrome-devtools__take_snapshot, Read
---

# Fill Custom Fields Skill

填写表单中的自定义选择字段。

## 前置条件

- 已填写基本信息 (fill_basic_info)
- preferences.json 中有 common_answers

## 常见自定义字段

### 工作授权类
| 问题 | 选项 | 默认值来源 |
|------|------|-----------|
| Work Authorization | Authorized, Need Sponsorship | common_answers.work_authorization |
| Visa Sponsorship | Yes, No | common_answers.visa_sponsorship_required |
| Right to Work | Yes, No | work_authorization |

### 地点类
| 问题 | 选项 | 默认值来源 |
|------|------|-----------|
| Willing to Relocate | Yes, No, Maybe | common_answers.willing_to_relocate |
| Work Location | Remote, Hybrid, On-site | search_preferences.remote_preference |

### 经验类
| 问题 | 选项 | 默认值来源 |
|------|------|-----------|
| Years of Experience | 0-1, 1-3, 3-5, 5-10, 10+ | 简历解析 |
| Current Employment | Employed, Unemployed, Student | - |

### EEO 字段 (通常可选)
| 问题 | 建议选择 |
|------|----------|
| Gender | Decline to answer |
| Ethnicity | Decline to answer |
| Veteran Status | Decline to answer |
| Disability | Decline to answer |

## 执行步骤

### Step 1: 读取默认回答

```
Read k:\JobPilot\config\preferences.json
```

提取 `common_answers` 部分。

### Step 2: 填写下拉选择

对于 `<select>` 元素：

```
mcp__chrome-devtools__fill({
  uid: "{select_uid}",
  value: "Authorized to work in the US"
})
```

### Step 3: 填写单选按钮

对于 radio button，点击对应选项：

```
mcp__chrome-devtools__click({
  uid: "{radio_option_uid}"
})
```

### Step 4: 填写复选框

对于 checkbox，如果需要选中：

```
mcp__chrome-devtools__click({
  uid: "{checkbox_uid}"
})
```

### Step 5: 验证

重新获取快照确认填写结果。

## 输出格式

```
## 自定义字段已填写

| 字段 | 类型 | 选择值 | 状态 |
|------|------|--------|------|
| Work Authorization | select | Authorized to work | ✓ |
| Sponsorship Required | radio | No | ✓ |
| Willing to Relocate | select | Yes | ✓ |
| Remote Preference | select | Remote | ✓ |
| Terms Agreement | checkbox | Checked | ✓ |

**EEO 字段 (可选)**:
- Gender: Skipped
- Ethnicity: Skipped
- Veteran: Skipped

**填写字段数**: 5
**跳过字段数**: 3 (EEO)

**下一步**: 运行 match_qa 填写问答字段
```

## 字段值映射

### 工作授权
| 表单选项 | 对应 preferences 值 |
|----------|---------------------|
| "Authorized to work in the US" | work_authorization: "Authorized..." |
| "I am authorized to work" | work_authorization: "Authorized..." |
| "Yes" (for authorized question) | work_authorization: "Authorized..." |

### 远程偏好
| 表单选项 | 对应 preferences 值 |
|----------|---------------------|
| "Remote" | remote_preference: "remote" |
| "Hybrid" | remote_preference: "hybrid" |
| "On-site" | remote_preference: "onsite" |
| "No preference" | remote_preference: "any" |

## 注意事项

1. 选项文本可能不完全匹配，需要模糊匹配
2. EEO 字段通常标记为可选
3. 同意条款(Terms)通常必须勾选
4. 某些字段有依赖关系
