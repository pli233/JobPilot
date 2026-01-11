---
name: open_apply_page
description: 打开职位申请页面。导航到申请表单页面，准备进行自动填写。
trigger: ["打开申请页面", "open apply page", "开始申请"]
allowed-tools: mcp__chrome-devtools__navigate_page, mcp__chrome-devtools__take_snapshot, mcp__chrome-devtools__wait_for
---

# Open Apply Page Skill

打开职位申请页面。

## 输入参数

| 参数 | 说明 | 示例 |
|------|------|------|
| url | 申请页面 URL | "https://boards.greenhouse.io/..." |
| wait_for | 等待元素出现 (可选) | "Submit" |

## 前置条件

- Chrome 浏览器已打开
- Chrome DevTools MCP 已连接

## 执行步骤

### Step 1: 导航到申请页面

```
mcp__chrome-devtools__navigate_page({
  url: "{url}",
  type: "url"
})
```

### Step 2: 等待页面加载

等待关键元素出现，确保页面完全加载：

```
mcp__chrome-devtools__wait_for({
  text: "Apply" 或 "Submit" 或 "Application",
  timeout: 10000
})
```

### Step 3: 获取页面快照

**重要**: 必须获取快照才能操作页面元素！

```
mcp__chrome-devtools__take_snapshot({
  verbose: false
})
```

快照返回页面元素及其 uid，用于后续操作。

## 支持的申请平台

| 平台 | URL 特征 | 说明 |
|------|----------|------|
| LinkedIn | linkedin.com/jobs | 原生申请或跳转 |
| Greenhouse | boards.greenhouse.io | 常见 ATS |
| Lever | jobs.lever.co | 常见 ATS |
| Workday | myworkdayjobs.com | 企业级 ATS |
| Indeed | indeed.com/applystart | Indeed 申请 |
| Ashby | jobs.ashbyhq.com | 新兴 ATS |

## 输出

```
## 申请页面已打开

URL: {url}
平台: Greenhouse
状态: 页面加载完成

检测到表单字段:
- 姓名输入框
- 邮箱输入框
- 电话输入框
- 简历上传
- 多个问答字段
- 提交按钮

下一步: 运行 "analyze_form" 分析表单结构
```

## 常见问题处理

### 登录要求
如果需要登录，提示用户手动登录后重试。

### 页面跳转
有些职位会跳转到外部网站：
1. 检测新 URL
2. 等待新页面加载
3. 重新获取快照

### Cookie 弹窗
如果有 Cookie 同意弹窗，先点击接受。

## 注意事项

1. 每次页面刷新后需要重新获取快照
2. uid 是临时的，页面变化后失效
3. 某些页面可能有反自动化检测
4. 建议添加随机延迟模拟人类行为
