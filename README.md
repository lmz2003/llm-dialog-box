# LLM Dialog Box

基于 Vue 3 + TypeScript + Vite 构建的现代化 AI 对话应用，集成 Coze API，提供独立对话框与内联对话框两种交互模式。

## 项目访问地址

[ai-dialog.maozi.io](https://ai-dialog.maozi.io/)

## 项目概述

LLM Dialog Box 是一个功能完善的 AI 对话前端应用，支持与 Coze 智能体进行实时对话。项目采用组件化架构设计，提供灵活的对话交互方式，支持流式响应、Markdown 渲染、代码高亮、文件上传等核心功能。

## 功能特性

### 核心功能

- **双模式对话界面**
  - 独立对话框：完整的聊天界面，支持会话历史管理
  - 内联对话框：轻量级对话组件，支持三种形态切换

- **流式响应**：实时展示 AI 回复，提升用户体验

- **Markdown 支持**：完整支持 Markdown 语法渲染

- **代码高亮**：集成 highlight.js，支持多种编程语言语法高亮

- **文件上传**：支持上传文件到对话中（最大 512MB）

- **会话管理**：本地存储会话历史，支持多会话切换

- **快捷键支持**：`Ctrl+K` 快速打开内联对话框

### 界面预览

#### 主页面
![主页面](https://github.com/user-attachments/assets/cc6e7773-3a18-4259-8ebe-d4b2e3ce6d71)

#### 对话详情页
![对话详情页](https://github.com/user-attachments/assets/b0e17579-a415-4e43-8113-42266f3ba662)

#### 内联对话框
![内联对话框-收缩形态](https://github.com/user-attachments/assets/95e654e3-a0b8-43f5-aaa7-5b50afbb6e3f)

![内联对话框-展开形态](https://github.com/user-attachments/assets/7f992484-7b7b-42a6-8060-596d33ee808c)

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | Vue 3.5+ |
| 开发语言 | TypeScript 5.7+ |
| 构建工具 | Vite 6.1+ |
| UI 组件库 | Element Plus 2.9+ |
| 状态管理 | Pinia 3.0+ |
| 路由管理 | Vue Router 4.0+ |
| Markdown 渲染 | marked 15.0+ |
| 代码高亮 | highlight.js 11.11+ |
| API 集成 | Coze API |

## 项目结构

```
llm-dialog-box/
├── public/                     # 静态资源
├── service/                    # Coze API 服务端示例代码
│   ├── Coze/
│   │   └── Coze.ts
│   └── src/
│       └── index.ts
├── src/
│   ├── api/                    # API 接口封装
│   │   ├── chat.ts             # 对话 API
│   │   ├── conversation.ts     # 会话 API
│   │   ├── message.js          # 消息列表 API
│   │   └── upload.js           # 文件上传 API
│   ├── assets/                 # 资源文件
│   ├── components/             # 组件目录
│   │   ├── ChatAside.vue       # 侧边栏组件
│   │   ├── ChatHeader.vue      # 头部组件
│   │   ├── ChatMain.vue        # 主聊天区域组件
│   │   ├── InlineDialog.vue    # 内联对话框组件
│   │   └── NewChat.vue         # 新建对话组件
│   ├── router/                 # 路由配置
│   │   └── index.ts
│   ├── stores/                 # 状态管理
│   │   ├── chat.js             # 独立对话框状态
│   │   ├── inlineChat.js       # 内联对话框状态
│   │   └── loading.js          # 加载状态
│   ├── utils/                  # 工具函数
│   │   ├── chatHelper.js       # 消息处理工具
│   │   └── request.ts          # Axios 封装
│   ├── view/                   # 视图组件
│   │   └── BaseDialog.vue      # 基础对话框布局
│   ├── App.vue                 # 根组件
│   ├── main.ts                 # 入口文件
│   └── style.css               # 全局样式
├── .env                        # 环境变量配置
├── index.html                  # HTML 模板
├── package.json                # 项目配置
├── tsconfig.json               # TypeScript 配置
└── vite.config.ts              # Vite 配置
```

## 快速开始

### 环境要求

- Node.js 18.0+
- npm 9.0+ 或 pnpm 8.0+

### 安装依赖

```bash
npm install
# 或
pnpm install
```

### 配置环境变量

在项目根目录创建 `.env` 文件，配置 Coze API 凭证：

```env
COZE_API_TOKEN='your_coze_api_token'
COZE_BOT_ID='your_bot_id'
```

或在 `src/api/chat.ts` 和 `src/api/conversation.ts` 中直接配置：

```typescript
const token: string = 'your_coze_api_token';
const botId: string = 'your_bot_id';
```

### 获取 Coze 凭证

1. 访问 [Coze 官网](https://www.coze.cn/) 并登录
2. 进入个人中心 -> 个人令牌，创建或获取 API Token
3. 创建或选择一个智能体，获取 Bot ID

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 使用指南

### 独立对话框模式

1. 访问应用主页，左侧显示会话历史列表
2. 点击「新建对话」开始新会话
3. 在输入框输入问题，点击发送或按 `Enter` 键
4. 点击附件图标可上传文件（支持最大 512MB）
5. 点击左侧历史记录可切换会话

### 内联对话框模式

1. 按 `Ctrl+K` 快捷键打开内联对话框
2. 输入问题后自动进入对话形态
3. 点击「新建对话」开始新会话
4. 按 `Esc` 键关闭对话框

> **注意**：内联对话框不支持文件上传功能

## API 文档

### Chat API

#### createChat

创建对话请求

```typescript
interface ChatRequestData {
  additional_messages?: Array<{
    role: string;
    content: string;
    content_type: string;
  }>;
  stream?: boolean;
  auto_save_history?: boolean;
}

function createChat(data: ChatRequestData, conversationId?: string): Promise<Response>
```

### Conversation API

#### createConversation

创建新会话

```typescript
interface ConversationRequestData {
  messages?: Array<{
    role: string;
    type: string;
    content: string;
    contentType: string;
  }>;
}

function createConversation(data: ConversationRequestData): Promise<ConversationResponse>
```

### Message API

#### queryMsgList

查询会话消息列表

```typescript
function queryMsgList(data: object, conversationId: string): Promise<Response>
```

### Upload API

#### uploadFile

上传文件到 Coze 平台

```typescript
function uploadFile(file: File): Promise<UploadResponse>
```

## 组件说明

### BaseDialog

基础布局组件，包含侧边栏和主内容区域。

**Props**: 无

**Events**:
- `chatSelected`: 会话选中事件

### InlineDialog

内联对话框组件，支持三种形态切换。

**形态**:
- `collapsed`: 收缩形态，显示为搜索框
- `expanded`: 展开形态，显示对话框
- `chatting`: 对话形态，显示对话内容

**快捷键**:
- `Ctrl+K`: 打开对话框
- `Esc`: 关闭对话框

### ChatMain

主聊天区域组件，处理消息展示和发送。

**功能**:
- 消息列表渲染
- 文件上传
- 流式响应处理
- Markdown 渲染

## 开发规范

### 代码风格

- 使用 TypeScript 进行类型约束
- 组件使用 `<script setup>` 语法
- 遵循 Vue 3 组合式 API 最佳实践

### 提交规范

项目使用 cz-git 进行提交信息规范：

```bash
npm run commit
```

## 注意事项

1. **API 凭证安全**：请勿将 API Token 提交到公开仓库
2. **会话存储**：会话历史使用浏览器本地存储，清除浏览器数据会丢失历史记录
3. **文件大小限制**：单文件上传最大支持 512MB
4. **浏览器兼容**：建议使用现代浏览器（Chrome、Firefox、Edge 等）

## 已知限制

- 暂不支持 H5 和小程序形态
- 内联对话框不支持文件上传功能
- 会话历史仅存储在本地浏览器

## 后续计划

- [ ] 兼容 H5 和小程序形态（使用 Taro 框架）
- [ ] 封装为独立组件库
- [ ] 支持多主题切换
- [ ] 支持会话导出功能
- [ ] 支持云端会话同步

## 贡献指南

欢迎提交 Issue 和 Pull Request 参与项目贡献。

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

本项目仅供学习和研究使用。

## 致谢

- [Vue.js](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Element Plus](https://element-plus.org/)
- [Coze](https://www.coze.cn/)
