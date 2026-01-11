---
name: upload_resume
description: 上传简历文件到项目，解析简历内容，用于自动申请时的字段映射。
trigger: ["上传简历", "upload resume", "添加简历", "导入简历"]
allowed-tools: Read, Write, Bash, AskUserQuestion
---

# Upload Resume Skill

上传和管理简历文件。

## 输入参数

- **file_path**: 简历文件路径 (PDF/DOCX)
- **name**: 简历名称，默认 "resume_main"
- **set_default**: 是否设为默认简历，默认 true

## 执行步骤

### Step 1: 获取简历路径

如果用户未提供路径，使用 AskUserQuestion 询问：

```
请提供简历文件的完整路径：
例如: C:\Users\username\Documents\resume.pdf
```

### Step 2: 验证文件

检查文件是否存在且格式正确 (PDF/DOCX)。

### Step 3: 复制到项目目录

```bash
cp "{source_path}" "data/resumes/{name}.pdf"
```

### Step 4: 解析简历内容 (可选)

如果是文本可读的 PDF，提取关键信息：
- 联系信息
- 技能列表
- 工作经历
- 教育背景

### Step 5: 更新配置

如果 set_default = true，更新 preferences.json 记录默认简历路径。

## 输出

```
## 简历上传成功

文件: {name}.pdf
路径: data/resumes/{name}.pdf
大小: {size} KB
默认简历: {yes/no}

已有简历:
1. resume_main.pdf (默认)
2. resume_tech.pdf
```

## 管理多份简历

支持上传多份简历用于不同类型的职位：
- resume_main.pdf - 通用简历
- resume_frontend.pdf - 前端开发简历
- resume_backend.pdf - 后端开发简历
- resume_fullstack.pdf - 全栈开发简历
