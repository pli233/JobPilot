---
name: add_qa
description: 添加新的问答模板，用于自动申请时匹配和填写常见问题。
trigger: ["添加问答", "add qa", "新建模板", "添加模板"]
allowed-tools: Read, Write, AskUserQuestion
---

# Add QA Skill

添加新的问答模板到 qa_templates.json。

## 模板结构

```json
{
  "id": "unique_id",
  "category": "category_name",
  "question_patterns": ["pattern1", "pattern2"],
  "answer_template": "Answer with {variable}",
  "variables": ["variable"]
}
```

## 预设类别

| 类别 | 说明 |
|------|------|
| why_company | 为什么想加入这家公司 |
| salary | 薪资期望 |
| availability | 可开始工作时间 |
| experience | 工作经验 |
| behavioral | 行为面试问题 |
| logistics | 后勤问题 (远程、搬迁等) |
| technical | 技术问题 |
| custom | 自定义 |

## 执行步骤

### Step 1: 读取现有模板

```
Read k:\JobPilot\config\qa_templates.json
```

### Step 2: 收集新模板信息

使用 AskUserQuestion 收集：

1. **问题示例**
   ```
   请输入申请表中会遇到的问题：
   例如: "Why are you interested in this role?"
   ```

2. **选择类别**
   ```
   选择问题类别:
   - why_company
   - salary
   - availability
   - experience
   - behavioral
   - logistics
   - custom
   ```

3. **输入答案模板**
   ```
   请输入答案模板，可使用 {变量} 占位符：
   例如: "I have {years} years of experience in {field}."
   ```

4. **确认变量**
   ```
   检测到以下变量: years, field
   请为每个变量提供默认值或描述。
   ```

### Step 3: 生成问题匹配模式

基于问题示例，生成正则匹配模式：
- "Why are you interested" → ["why.*interested", "interest.*role"]
- "years of experience" → ["years.*experience", "how long.*work"]

### Step 4: 保存模板

更新 qa_templates.json。

## 输出

```
## 问答模板已添加

ID: experience_years_2
类别: experience
问题模式: ["years.*experience", "how long.*work"]
答案模板: "I have {years} years of professional experience in {field}, specializing in {specialty}."
变量: years, field, specialty

已有模板数量: 7
```

## 常用模板示例

### Why Company
```json
{
  "id": "why_company",
  "category": "why_company",
  "question_patterns": ["why.*interested", "why do you want"],
  "answer_template": "I'm excited about {company}'s mission in {field}. With my background in {skill}, I can contribute to {contribution}.",
  "variables": ["company", "field", "skill", "contribution"]
}
```

### Salary Expectation
```json
{
  "id": "salary",
  "category": "salary",
  "question_patterns": ["salary", "compensation", "pay expectation"],
  "answer_template": "Based on my experience, I'm targeting {range}. I'm flexible and open to discussing total compensation.",
  "variables": ["range"]
}
```
