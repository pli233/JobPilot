---
name: manage_qa
description: 查看、编辑、删除问答模板。管理 qa_templates.json 中的所有模板。
trigger: ["管理问答", "manage qa", "查看模板", "编辑模板", "删除模板"]
allowed-tools: Read, Write, AskUserQuestion
---

# Manage QA Skill

管理问答模板库。

## 功能

1. **查看所有模板** - 列出所有问答模板
2. **按类别筛选** - 查看特定类别的模板
3. **编辑模板** - 修改现有模板
4. **删除模板** - 移除不需要的模板
5. **测试匹配** - 测试问题是否能匹配到模板

## 执行步骤

### Step 1: 读取模板库

```
Read k:\JobPilot\config\qa_templates.json
```

### Step 2: 选择操作

使用 AskUserQuestion：

```
选择操作:
1. 查看所有模板
2. 按类别筛选
3. 编辑模板
4. 删除模板
5. 测试匹配
```

### 查看所有模板

输出格式：
```
## 问答模板库

共 {count} 个模板

### why_company (2)
1. [why_company] "Why are you interested..."
   → "I'm excited about {company}'s mission..."

2. [why_company_culture] "Why this company's culture..."
   → "I value {company}'s emphasis on..."

### salary (1)
1. [salary] "What's your salary expectation..."
   → "I'm targeting {range}..."

### experience (2)
...
```

### 按类别筛选

询问类别后，只显示该类别的模板。

### 编辑模板

1. 询问模板 ID
2. 显示当前内容
3. 询问要修改的字段：
   - question_patterns
   - answer_template
   - variables
4. 确认并保存

### 删除模板

1. 询问模板 ID
2. 显示模板内容确认
3. 确认删除
4. 更新文件

### 测试匹配

1. 询问问题文本
2. 遍历所有模板的 question_patterns
3. 显示匹配结果和得分

```
## 匹配测试

问题: "What are your salary expectations for this role?"

匹配结果:
1. [salary] 匹配度: 95%
   模式: "salary" ✓
   答案预览: "I'm targeting $150,000-$180,000..."

2. [compensation] 匹配度: 80%
   模式: "compensation" ✗ (未匹配)

未找到更多匹配。
```

## 输出

操作完成后显示更新摘要：

```
## 操作完成

操作: 编辑模板
模板 ID: salary
修改字段: answer_template
旧值: "I'm targeting {range}..."
新值: "Based on my {years} years of experience, I'm targeting {range}..."

模板库状态: 7 个模板
```
