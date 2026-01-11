---
name: match_qa
description: 匹配申请表单中的问答字段到模板库，生成答案。对于无匹配的问题，使用 AI 生成并请求用户确认。
trigger: ["匹配问答", "match qa", "填写问答"]
allowed-tools: Read, AskUserQuestion
---

# Match QA Skill

匹配问答字段到模板并生成答案。

## 前置条件

- 已分析表单，识别到 textarea 问答字段
- qa_templates.json 中有问答模板

## 执行步骤

### Step 1: 读取配置文件

```
Read config/qa_templates.json   # 问答模板
Read config/profile.json        # 个人信息，用于生成个性化答案
```

### Step 2: 提取表单问题

从表单分析结果中提取所有问答字段：
- textarea 元素
- 较长的 text 输入
- label 包含问号的字段

### Step 3: 匹配模板

对每个问题：

1. 遍历模板的 `question_patterns`
2. 使用正则匹配计算相似度
3. 选择最高匹配的模板

```python
def match_template(question, templates):
    best_match = None
    best_score = 0

    for template in templates:
        for pattern in template['question_patterns']:
            if re.search(pattern, question, re.IGNORECASE):
                score = len(pattern) / len(question)  # 简化评分
                if score > best_score:
                    best_score = score
                    best_match = template

    return best_match, best_score
```

### Step 4: 生成答案

#### 匹配成功 (score >= 0.8)

使用模板生成答案，替换变量：

```
模板: "I have {years} years of experience in {field}."
变量值: { years: "7", field: "backend development" }
答案: "I have 7 years of experience in backend development."
```

#### 匹配失败 (score < 0.8)

使用 AI 根据以下上下文生成答案：
- 问题内容
- 职位描述
- 用户简历信息
- 公司信息

然后使用 AskUserQuestion 确认：

```
问题: "What makes you unique?"

AI 生成的答案:
"My unique combination of 7 years of backend experience and my passion
for AI safety makes me well-suited for this role. I've led multiple
projects from conception to production..."

请确认或修改此答案：
[确认] [修改] [跳过]
```

### Step 5: 保存新模板（可选）

如果用户修改了答案，询问是否保存为新模板。

## 输出格式

```
## 问答匹配结果

共 {count} 个问答字段

### 自动匹配 (3)

| 问题 | 匹配模板 | 置信度 |
|------|----------|--------|
| Why are you interested? | why_company | 95% |
| Salary expectation? | salary | 90% |
| When can you start? | availability | 88% |

生成的答案:

**Q1**: Why are you interested in this role?
**A1**: I'm excited about Anthropic's mission in AI safety. With my background
in Python and distributed systems, I can contribute to building reliable
AI systems.

**Q2**: What is your salary expectation?
**A2**: Based on my 7 years of experience, I'm targeting $180,000-$220,000.
I'm flexible and open to discussing total compensation.

**Q3**: When can you start?
**A3**: I can start within 2 weeks. I'm flexible on the exact date.

---

### 需要确认 (1)

**Q4**: What makes you unique for this role?

[AI 生成的答案]
My unique combination of strong technical skills and experience in...

请确认此答案或提供修改。

---

**下一步**: 确认所有答案后，运行 fill_form 填写表单
```

## 变量替换

常用变量及来源：

| 变量 | 来源 |
|------|------|
| {company} | 从职位信息提取 |
| {position} | 从职位信息提取 |
| {field} | 从职位描述推断 |
| {years} | profile.json work_experience 计算 |
| {skill} | 从职位要求匹配 |
| {range} | preferences.json salary 配置 |
| {timeframe} | 默认 "2 weeks" |

## 注意事项

1. 答案长度应适中（100-300 字）
2. 避免过于模板化的回答
3. 针对公司和职位定制化
4. 用户确认后再填写
