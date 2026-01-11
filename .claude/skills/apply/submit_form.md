---
name: submit_form
description: 提交申请表单。必须在用户确认后才能执行。提交后截图保存确认页面。
trigger: ["提交申请", "submit form", "提交表单"]
allowed-tools: mcp__chrome-devtools__click, mcp__chrome-devtools__wait_for, mcp__chrome-devtools__take_screenshot, mcp__chrome-devtools__take_snapshot, AskUserQuestion
---

# Submit Form Skill

提交申请表单。

## 重要提醒

**必须在用户明确确认后才能提交！**

提交前使用 AskUserQuestion 确认。

## 前置条件

- 所有必填字段已填写
- 简历已上传
- 问答已填写
- 预览截图已保存
- 用户已确认

## 执行步骤

### Step 1: 用户确认

必须先询问用户确认：

```
即将提交申请到 {company} - {position}

已填写字段:
- 基本信息: ✓
- 简历上传: ✓ (resume_main.pdf)
- 问答字段: ✓ (4/4)
- 自定义字段: ✓

预览截图已保存: anthropic-2025-01-11-preview.png

确认提交此申请？
[提交] [取消] [重新检查]
```

### Step 2: 点击提交按钮

用户确认后执行：

```
mcp__chrome-devtools__click({
  uid: "{submit_button_uid}"
})
```

### Step 3: 等待确认页面

等待提交成功的指示：

```
mcp__chrome-devtools__wait_for({
  text: "submitted" 或 "thank you" 或 "received",
  timeout: 15000
})
```

### Step 4: 截取确认截图

```
mcp__chrome-devtools__take_screenshot({
  fullPage: true,
  filePath: "k:\\JobPilot\\data\\screenshots\\{company}-{date}-confirmation.png"
})
```

### Step 5: 获取最终快照

记录确认页面内容：

```
mcp__chrome-devtools__take_snapshot({})
```

提取确认信息：
- 申请编号（如果有）
- 预计回复时间
- 下一步说明

## 输出格式

### 提交成功
```
## 申请提交成功

**公司**: Anthropic
**职位**: Senior Python Engineer
**提交时间**: 2025-01-11 10:35:22

**确认信息**:
- 申请编号: APP-2025-1234
- 预计回复: 2-3 周内
- 状态页面: https://boards.greenhouse.io/status/...

**截图已保存**:
- 预览: anthropic-2025-01-11-preview.png
- 确认: anthropic-2025-01-11-confirmation.png

**下一步**: 运行 tracker/add_application 记录此申请
```

### 提交失败
```
## 申请提交失败

**错误信息**: {error_message}

**可能原因**:
1. 必填字段未填写
2. 格式验证失败
3. 网络问题
4. 已申请过此职位

**截图已保存**: anthropic-2025-01-11-error.png

**建议**:
- 检查表单错误提示
- 重新获取快照
- 修复问题后重试
```

## 多页表单处理

有些申请表是多页的：

1. **识别当前页**
   - 查找 "Next" 按钮
   - 查找进度指示器

2. **点击 Next**
   ```
   mcp__chrome-devtools__click({ uid: "{next_button_uid}" })
   ```

3. **等待新页面加载**
   ```
   mcp__chrome-devtools__wait_for({ text: "...", timeout: 5000 })
   ```

4. **重新获取快照**
   - 新页面的元素有新的 uid

5. **继续填写**
   - 重复填写流程

6. **最后一页提交**
   - 找到 "Submit" 而不是 "Next"

## 常见问题

### 表单验证失败
- 检查页面上的错误提示
- 截图保存错误页面
- 修复后重试

### 超时
- 网络可能慢
- 增加等待时间
- 检查页面是否响应

### CAPTCHA
- 提示用户手动完成
- 等待用户确认后继续

## 注意事项

1. **绝对不要**在没有用户确认的情况下提交
2. 提交后无法撤回
3. 同一职位不要重复申请
4. 保存所有截图作为记录
