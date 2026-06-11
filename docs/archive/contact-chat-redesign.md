# 联系模块重设计 — 聊天气泡对话式

将现有的传统表单联系页面替换为 **模拟即时通讯界面** 的对话式联系页，通过气泡问答逐步收集用户信息，最终通过 `mailto:` 发送。

---

## 设计概览

```mermaid
flowchart TD
  A["用户点击「联系」标签"] --> B["进入聊天界面"]
  B --> C["Oxygen 自动发送欢迎语"]
  C --> D["Oxygen 提问：你好！怎么称呼你？"]
  D --> E["用户输入姓名"]
  E --> F["Oxygen 提问：你的邮箱是？"]
  F --> G["用户输入邮箱"]
  G --> H["Oxygen 提问：想聊点什么？"]
  H --> I["用户输入消息"]
  I --> J["Oxygen 汇总确认 + 发送"]
  J --> K["打开 mailto 链接"]
  K --> L["Oxygen 告别语 + 社交链接卡片"]
```

### 核心交互

| 阶段 | Oxygen 消息 | 用户操作 |
|---|---|---|
| 欢迎 | "你好！👋 我是 Oxygen，很高兴你来到这里！" | 自动播放 |
| 姓名 | "请问怎么称呼你？" | 文字输入 |
| 邮箱 | "太好了，{name}！方便留个邮箱吗？这样我可以回复你 📮" | 文字输入 |
| 消息 | "OK！有什么想对我说的？或者你也可以直接选择下面的话题 👇" + 快速回复按钮 | 文字输入 / 点击预设按钮 |
| 确认 | "收到！我整理一下... 📝\n姓名：xxx\n邮箱：xxx\n消息：xxx\n确认发送吗？" | 点击「发送 ✓」/「重来 ↺」按钮 |
| 完成 | "消息已准备好！邮件客户端会自动打开 🚀\n也可以通过以下方式找到我：" + 社交卡片 | — |

### 视觉亮点

- **打字指示器**："正在输入..." 的三点跳动动画，出现在 Oxygen 回复前
- **气泡弹入动效**：`framer-motion` 的 `spring` 弹性进入
- **预设快速回复**：「💼 合作咨询」「💬 技术交流」「🎯 面试机会」「👋 就是打个招呼」
- **头像 + 时间戳**：左侧 Oxygen 头像 + 气泡上方微小时间标记
- **微信二维码**：完成阶段在社交卡片中展示
- **全面适配**：明暗主题 + 移动端响应式

---

## 方案变更

### 联系组件

#### [NEW] [ContactChat.tsx](file:///Users/yangqian/本人代码/Tech-Centric/src/components/ContactChat.tsx)

完全替代现有 [Contact.tsx](file:///Users/yangqian/%E6%9C%AC%E4%BA%BA%E4%BB%A3%E7%A0%81/Tech-Centric/src/components/Contact.tsx)，核心结构：

1. **状态机**：用 `useState` 管理对话阶段（`greeting → name → email → message → confirm → done`）
2. **消息数组**：`messages: { id, sender: 'bot'|'user', text, timestamp }[]`
3. **打字延迟**：Oxygen 回复前显示 `TypingIndicator`（1-1.5 秒），模拟真实聊天节奏
4. **输入验证**：邮箱阶段实时校验格式，错误时 Oxygen 友好提醒
5. **快速回复按钮**：消息阶段提供 4 个预设选项，点击即填充
6. **确认摘要**：汇总展示用户输入，提供「发送」/「重来」按钮
7. **发送**：复用现有 `mailto:` 逻辑，收件人 `3199313768@qq.com`
8. **完成后**：展示社交链接卡片 + 微信二维码（复用 `personalInfo` 数据）
9. **localStorage**：未完成的对话不持久化，每次进入重新开始，保持简洁

---

### 样式

#### [MODIFY] [globals.css](file:///Users/yangqian/本人代码/Tech-Centric/src/app/globals.css)

新增聊天 UI 专用的 CSS 关键帧动画：

- `@keyframes typing-bounce`：三点弹跳动画
- `@keyframes bubble-in`：气泡弹入效果

> 颜色全部使用现有 CSS 变量（`--color-cyan`、`--color-card-bg` 等），明暗主题自动适配。

---

### 页面集成

#### [MODIFY] [page.tsx](file:///Users/yangqian/本人代码/Tech-Centric/src/app/page.tsx)

```diff
-import { Contact } from '@/components/Contact'
+import { ContactChat } from '@/components/ContactChat'
```

```diff
 case 'contact':
-  return <Contact />
+  return <ContactChat />
```

> 旧的 [Contact.tsx](file:///Users/yangqian/%E6%9C%AC%E4%BA%BA%E4%BB%A3%E7%A0%81/Tech-Centric/src/components/Contact.tsx) 保留不删，方便回退。

---

## 验证计划

### 浏览器手动验证

1. 打开 `http://localhost:3000`，点击导航栏「联系」标签
2. 验证以下完整对话流程：
   - Oxygen 欢迎语自动弹出（带打字动画延迟）
   - 输入姓名 → Oxygen 确认并提问邮箱
   - 输入合法邮箱 → Oxygen 确认并提问消息
   - 输入非法邮箱 → Oxygen 友好提示重新输入
   - 输入消息（或点击快速回复按钮）→ Oxygen 汇总确认
   - 点击「发送」→ `mailto:` 链接打开邮件客户端
   - 点击「重来」→ 对话重置回起点
3. 切换明/暗主题，确认所有元素颜色适配正常
4. 缩小浏览器窗口至 375px 宽，验证移动端响应式布局
