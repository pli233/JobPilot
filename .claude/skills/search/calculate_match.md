---
name: calculate_match
description: 计算职位与简历的匹配度。分析技能、经验、要求的匹配程度，给出评分。
trigger: ["计算匹配度", "calculate match", "匹配分析", "职位匹配"]
allowed-tools: Read
---

# Calculate Match Skill

计算职位与简历的匹配度。

## 输入参数

| 参数 | 说明 |
|------|------|
| job_description | 职位描述（完整文本） |
| resume_path | 简历路径（可选，默认使用主简历） |

## 匹配维度

| 维度 | 权重 | 说明 |
|------|------|------|
| skills_match | 35% | 技能要求匹配度 |
| experience_match | 25% | 工作年限匹配度 |
| education_match | 15% | 学历要求匹配度 |
| keywords_match | 15% | 关键词匹配度 |
| location_match | 10% | 地点/远程匹配度 |

## 执行步骤

### Step 1: 读取个人档案和偏好

读取个人档案获取技能和经历：
```
Read config/profile.json
```

提取的信息：
- skills (技能列表)
- work_experience (工作年限)
- education (学历)

读取求职偏好获取地点偏好：
```
Read config/preferences.json
```

提取的信息：
- job_search.remote_preference (远程偏好)
- job_search.locations (偏好地点)

可选：读取简历 PDF 获取更详细的信息：
```
Read data/resumes/resume_main.pdf
```

### Step 2: 提取职位要求

从职位描述中提取：
- Required skills（必需技能）
- Preferred skills（优选技能）
- Years of experience（经验年限）
- Education requirements（学历要求）
- Location（地点要求）

### Step 3: 计算各维度得分

#### 技能匹配 (35%)
```
matched_required = 匹配的必需技能数 / 总必需技能数
matched_preferred = 匹配的优选技能数 / 总优选技能数
skills_score = matched_required * 0.7 + matched_preferred * 0.3
```

#### 经验匹配 (25%)
```
if 简历年限 >= 要求年限:
    experience_score = 100
elif 简历年限 >= 要求年限 - 1:
    experience_score = 80
else:
    experience_score = max(0, 100 - (要求年限 - 简历年限) * 20)
```

#### 学历匹配 (15%)
```
学历等级: PhD > Master > Bachelor > Associate
if 简历学历 >= 要求学历:
    education_score = 100
else:
    education_score = 70
```

#### 关键词匹配 (15%)
```
keywords = 提取职位描述中的技术关键词
matched = 简历中出现的关键词数
keywords_score = matched / len(keywords) * 100
```

#### 地点匹配 (10%)
```
if 职位支持远程 and 用户偏好远程:
    location_score = 100
elif 职位地点 == 用户偏好地点:
    location_score = 100
elif 职位支持混合:
    location_score = 80
else:
    location_score = 50
```

### Step 4: 计算总分

```
total_score = (
    skills_score * 0.35 +
    experience_score * 0.25 +
    education_score * 0.15 +
    keywords_score * 0.15 +
    location_score * 0.10
)
```

### 输出格式

```
## 匹配度分析

### 总评分: 85/100 (Very Good Match)

---

### 技能匹配 (35%) - 90分
**匹配的必需技能**: 8/9
- ✓ Python
- ✓ Django
- ✓ PostgreSQL
- ✓ Docker
- ✓ AWS
- ✓ REST API
- ✓ Git
- ✓ Linux
- ✗ Kubernetes (未匹配)

**匹配的优选技能**: 3/5
- ✓ GraphQL
- ✓ Redis
- ✓ CI/CD
- ✗ Terraform
- ✗ Go

### 经验匹配 (25%) - 100分
**要求**: 5+ years
**你的经验**: 7 years
状态: 超出要求

### 学历匹配 (15%) - 100分
**要求**: Bachelor's degree
**你的学历**: Master's degree
状态: 超出要求

### 关键词匹配 (15%) - 75分
**匹配关键词**: 15/20
高频词: distributed systems, microservices, scalability

### 地点匹配 (10%) - 100分
**职位**: San Francisco (Remote OK)
**你的偏好**: Remote
状态: 完美匹配

---

### 建议

1. **强项**: Python 开发、后端架构、云服务
2. **待提升**: 建议学习 Kubernetes 基础
3. **申请建议**: 强烈推荐申请，匹配度高

### 匹配等级说明

| 分数 | 等级 | 说明 |
|------|------|------|
| 90-100 | Excellent | 非常匹配，优先申请 |
| 80-89 | Very Good | 匹配度高，推荐申请 |
| 70-79 | Good | 较好匹配，可以申请 |
| 60-69 | Fair | 一般匹配，看情况申请 |
| <60 | Low | 匹配度低，建议跳过 |
```

## 注意事项

1. 匹配度仅供参考，不代表实际录用概率
2. 定期更新简历技能列表
3. 软技能难以量化，未包含在评分中
4. 特定领域经验可能比通用年限更重要
