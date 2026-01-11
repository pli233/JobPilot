---
name: upload_resume
description: 上传简历文件到申请表单。支持 PDF 和 DOCX 格式。
trigger: ["上传简历到表单", "upload resume to form", "上传简历文件"]
allowed-tools: mcp__chrome-devtools__upload_file, mcp__chrome-devtools__take_snapshot, mcp__chrome-devtools__wait_for, Read
---

# Upload Resume Skill

上传简历到申请表单的文件上传字段。

## 前置条件

- 已分析表单，识别到文件上传字段
- 简历文件存在于 data/resumes/ 目录

## 执行步骤

### Step 1: 确认简历文件路径

默认路径: `k:\JobPilot\data\resumes\resume_main.pdf`

如果需要特定简历，可从参数指定或从 preferences.json 读取。

### Step 2: 识别上传字段

从表单分析结果中获取文件上传字段的 uid：
- type="file"
- accept 包含 ".pdf" 或 ".doc"
- label 包含 "resume" 或 "cv"

### Step 3: 上传文件

```
mcp__chrome-devtools__upload_file({
  uid: "{file_input_uid}",
  filePath: "k:\\JobPilot\\data\\resumes\\resume_main.pdf"
})
```

### Step 4: 等待上传完成

某些平台会显示上传进度或确认：

```
mcp__chrome-devtools__wait_for({
  text: "uploaded" 或 "resume_main.pdf",
  timeout: 10000
})
```

### Step 5: 验证上传

重新获取快照，确认文件名显示在页面上。

## 输出格式

```
## 简历上传完成

文件: resume_main.pdf
大小: 245 KB
字段: Resume / CV
状态: 上传成功

页面显示: "resume_main.pdf (245 KB)"

**下一步**: 运行 match_qa 填写问答字段
```

## 支持的文件格式

| 格式 | MIME 类型 | 说明 |
|------|-----------|------|
| PDF | application/pdf | 推荐格式 |
| DOCX | application/vnd.openxmlformats... | Word 文档 |
| DOC | application/msword | 旧版 Word |
| RTF | application/rtf | 富文本 |
| TXT | text/plain | 纯文本 |

## 多简历支持

如果有多份简历：

```
data/resumes/
├── resume_main.pdf      # 通用简历
├── resume_frontend.pdf  # 前端简历
├── resume_backend.pdf   # 后端简历
└── resume_fullstack.pdf # 全栈简历
```

根据职位类型选择合适的简历。

## 常见问题

### 文件大小限制
大多数平台限制 5MB 或 10MB：
- 检查文件大小
- 如超限，提示用户压缩

### 格式不支持
如果平台不支持 PDF：
- 检查 accept 属性
- 提示用户转换格式

### 上传失败
可能原因：
1. 网络问题 - 重试
2. 文件损坏 - 检查文件
3. 字段 uid 失效 - 重新获取快照

### 隐藏的文件输入
有些平台使用隐藏的 input[type=file]，点击按钮触发：
```
mcp__chrome-devtools__click({ uid: "{upload_button_uid}" })
```
然后上传文件。

## 注意事项

1. 文件路径使用双反斜杠 `\\`
2. 确保文件存在且可读
3. 某些平台会解析简历内容
4. 上传后可能自动填充部分字段
