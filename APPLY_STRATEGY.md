# JobPilot 申请策略 v2.0

## 概览

JobPilot 现在采用**优先级路由策略**来自动申请职位。系统会自动检测职位所在平台，然后选择最合适的申请方式。

## 优先级

```
优先级 1: Simplify Copilot     ⭐⭐⭐⭐⭐  (最快，3-10 秒)
优先级 2: Greenhouse            ⭐⭐⭐⭐   (常见平台，1-2 分钟)
优先级 3: Ashby                 ⭐⭐⭐⭐   (Y Combinator 常用)
优先级 4: Workday               ⭐⭐⭐    (大型企业，2-3 分钟)
优先级 5: Lever                 ⭐⭐⭐    (中型公司)
优先级 6: 通用网页表单          ⭐⭐     (最后 fallback，2-5 分钟)
```

## 工作流程

### 1️⃣ 申请命令

```bash
"申请这个职位" [URL]
或
"apply to job" [URL]
```

### 2️⃣ 决策路由 (decide_apply_method)

系统打开职位页面，自动检测：

```
检测 Simplify 按钮？
├─ YES (可见 & 启用) → 使用 Simplify ✓
│   时间: 3-10 秒
│   行为: 点击按钮 → 自动申请
│   成功率: 95%+
│
└─ NO → 检测 URL 或页面特征
   ├─ greenhouse.io → 使用 Greenhouse
   │   时间: 1-2 分钟
   │   行为: 手工填表 → 需要用户确认
   │
   ├─ ashby.com → 使用 Ashby
   ├─ workday.com → 使用 Workday
   ├─ lever.co → 使用 Lever
   │   时间: 1-3 分钟
   │   行为: 手工填表 → 需要用户确认
   │
   └─ 其他 → 使用通用表单
       时间: 2-5 分钟
       行为: 尽力自动填表 → 可能需要用户补充
```

### 3️⃣ 执行申请

根据选择的方式，执行对应的技能：

| 方式 | 技能文件 | 文件大小 | 描述 |
|------|--------|--------|------|
| Simplify | `simplify_copilot_apply.md` | ⭐ 最小 | 一键申请，最简单 |
| Greenhouse | `greenhouse_apply.md` | ⭐⭐⭐ | 完整流程，有专门处理 |
| Ashby | (待开发) | - | 类似 Greenhouse |
| Workday | (待开发) | - | 企业级 HCM 系统 |
| Lever | (待开发) | - | 中型公司平台 |
| 通用表单 | `generic_form_apply.md` | ⭐⭐ | 尽力而为 |

### 4️⃣ 记录申请

系统自动保存：
- 申请方式 (simplify / greenhouse / ashby / 等)
- 申请时间
- 截图证明
- 成功/失败状态

## 配置文件

### config/application_strategy.json

定义申请优先级和检测规则：

```json
{
  "apply_strategy": "simplify_first",
  "priority_order": [
    {
      "priority": 1,
      "name": "simplify_copilot",
      "detection": ["simplify-icon", "simplify-button"]
    },
    {
      "priority": 2,
      "name": "greenhouse",
      "detection": ["greenhouse.io", "Apply for this job"]
    },
    // ...
  ]
}
```

**你可以编辑此文件来调整优先级！**

## 技能文件

### 核心技能

```
.claude/skills/apply/
├── decide_apply_method.md       ← 路由器（核心）
├── simplify_copilot_apply.md    ← Simplify 一键申请
├── greenhouse_apply.md          ← Greenhouse 平台申请
├── generic_form_apply.md        ← 通用表单 fallback
└── (待开发: ashby_apply.md, workday_apply.md, lever_apply.md)
```

### 辅助技能

```
.claude/skills/apply/
├── fill_basic_info.md           ← 填写基本信息
├── upload_resume.md             ← 上传简历
├── match_qa.md                  ← 匹配问答
├── check_duplicate.md           ← 检查重复
└── take_screenshot.md           ← 截图保存
```

## 使用示例

### 示例 1: Simplify 可用 (最好情况)

```
用户: "申请这个职位 https://www.anthropic.com/careers/roles/..."
↓
检测: 页面有 Simplify 按钮 ✓
↓
执行: simplify_copilot_apply
  1. 点击 Simplify 按钮
  2. 自动填表（通常无需用户干预）
  3. 申请完成
↓
时间: 3-10 秒 ⚡
```

### 示例 2: Greenhouse 平台

```
用户: "申请这个职位 https://job-boards.greenhouse.io/..."
↓
检测: URL 包含 greenhouse.io ✓
↓
执行: greenhouse_apply
  1. 打开页面
  2. 填写基本信息 (自动)
  3. 上传简历 (自动)
  4. 填写自定义问题 (用户确认)
  5. 处理人口统计信息 (如需要)
  6. 截图预览
  7. 用户确认 ← 必须！
  8. 提交申请
↓
时间: 1-2 分钟
```

### 示例 3: 未知平台 (Fallback)

```
用户: "申请这个职位 https://company.com/apply?job=123"
↓
检测: 无法识别平台
↓
执行: generic_form_apply
  1. 尽力自动填表
  2. 找不到的字段，询问用户
  3. 用户确认后提交
↓
时间: 2-5 分钟（取决于用户响应）
```

## 速率限制

```
Simplify:        无限制（已由插件处理）
Greenhouse:      每个公司无限制，平台间隔 2-3 秒
通用表单:        无限制
```

## 成功指标

申请成功的标志：

```
Simplify:
  ✓ 看到 "Application submitted successfully" 信息
  ✓ URL 跳转到确认页面
  ✓ 显示 application ID

Greenhouse:
  ✓ 页面显示 "Thank you"
  ✓ 显示 confirmation number
  ✓ 邮箱收到确认邮件（通常）

通用表单:
  ✓ 看到感谢页面 ("Thank you" / "Submitted")
  ✓ URL 变化（如跳转到确认页）
  ✓ 显示确认号或 receipt
```

## 故障排查

### Simplify 按钮找不到

**原因**:
1. 浏览器未安装 Simplify 插件
2. 该平台 Simplify 不支持
3. 页面未完全加载

**解决**:
- Fallback 到其他申请方式
- 系统会自动选择 Greenhouse 或通用表单

### 申请表单无法识别

**原因**:
- 表单使用非标准 HTML
- JavaScript 动态加载字段
- ATS 系统特殊布局

**解决**:
- 系统会询问用户补充缺失信息
- 或建议用户手动填写

### 提交失败

**常见原因**:
1. 验证码 (CAPTCHA) - 需要用户手动完成
2. 必填字段缺失 - 系统会提示
3. 表单验证错误 - 检查快照中的错误信息

**解决**:
- 按照快照中的错误提示修复
- 重新提交

## 常见问题

**Q: 为什么有时候申请这么快？**
A: 因为使用了 Simplify Copilot，它只需要点击按钮就能自动申请（3-10 秒）。

**Q: 我想优先使用某个平台怎么办？**
A: 编辑 `config/application_strategy.json`，修改 `priority_order` 数组的顺序。

**Q: 为什么有时候需要用户确认？**
A: 对于非 Simplify 申请，系统需要用户确认才能提交（避免误申请）。这是安全特性。

**Q: 申请失败了怎么办？**
A: 系统会保存错误的截图，你可以手动检查并重试。

**Q: 支持哪些平台？**
A:
- ✅ Simplify Copilot (所有支持的平台)
- ✅ Greenhouse
- ✅ 通用网页表单
- 🚧 Ashby (计划中)
- 🚧 Workday (计划中)
- 🚧 Lever (计划中)

## 未来改进

- [ ] 自动创建 Ashby、Workday、Lever 专用技能
- [ ] 改进通用表单识别算法
- [ ] 添加 LinkedIn Easy Apply 直接支持
- [ ] 记录申请方式统计（用于优化）
- [ ] 支持更多 ATS 系统

---

**更新日期**: 2026-01-11
**版本**: 2.0
**核心特性**: Simplify 优先级路由，自动平台检测，智能 fallback

