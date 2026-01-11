---
name: wait_for_element
description: 等待页面元素加载完成。用于处理动态加载的页面内容。
trigger: ["等待元素", "wait for element", "等待加载"]
allowed-tools: mcp__chrome-devtools__wait_for, mcp__chrome-devtools__take_snapshot
---

# Wait For Element Skill

等待页面元素加载。

## 输入参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| text | 等待出现的文本 | - |
| timeout | 超时时间 (ms) | 10000 |

## 执行步骤

### Step 1: 等待文本出现

```
mcp__chrome-devtools__wait_for({
  text: "{text}",
  timeout: {timeout}
})
```

### Step 2: 验证加载完成

等待成功后，获取新快照：

```
mcp__chrome-devtools__take_snapshot({})
```

## 常见等待场景

| 场景 | 等待文本 | 说明 |
|------|----------|------|
| 表单加载 | "Submit" | 等待提交按钮出现 |
| 登录后 | "Welcome" | 等待登录完成 |
| 搜索结果 | "results" | 等待搜索结果加载 |
| 页面跳转 | "Application" | 等待新页面加载 |
| 上传完成 | "uploaded" | 等待文件上传完成 |

## 输出格式

### 成功
```
## 元素已加载

等待文本: "Submit Application"
耗时: 2.3 秒
状态: 成功

页面快照已更新，可以继续操作。
```

### 超时
```
## 等待超时

等待文本: "Submit Application"
超时时间: 10 秒
状态: 失败

**可能原因**:
1. 页面加载缓慢
2. 文本不存在
3. 网络问题

**建议**:
- 增加超时时间
- 检查等待的文本是否正确
- 刷新页面重试
```

## 高级用法

### 等待多个条件

依次等待多个元素：

```
wait_for_element({ text: "Loading...", timeout: 5000 })  // 等待加载开始
wait_for_element({ text: "Submit", timeout: 15000 })    // 等待加载完成
```

### 动态内容

对于 AJAX 加载的内容：

```
// 点击触发加载
click({ uid: "load_more_button" })

// 等待新内容出现
wait_for_element({ text: "More results loaded" })
```

## 注意事项

1. 等待期间不要进行其他操作
2. 超时时间根据网络状况调整
3. 等待成功后需要重新获取快照
4. 某些动态内容可能需要多次等待
