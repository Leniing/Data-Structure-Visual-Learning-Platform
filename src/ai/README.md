# DeepSeek 本地接入

## 只需填写密钥

项目根目录 `.env.server.local` 中填写 `DEEPSEEK_API_KEY`。不要使用 `VITE_` 前缀，不要分享此文件或把密钥写进前端。该文件已被 Git 忽略。如果文件不存在，将 `.env.server.example` 复制为 `.env.server.local`。

默认 `DEEPSEEK_BASE_URL=https://api.deepseek.com`，`DEEPSEEK_MODEL=deepseek-flash`。模型可按你的账户可用模型调整。

## 启动

在项目根目录打开两个终端（使用项目现有 Node.js 环境，支持 `--env-file`）：

```powershell
node --env-file=.env.server.local server/chat.mjs
```

```powershell
node node_modules/vite/bin/vite.js
```

也可分别使用 `npm run dev:ai` 和 `npm run dev`。依赖未安装时先执行 `npm install`。打开 Vite 显示的网址即可。两个进程需保持运行；修改密钥后重启后端。后端端口为 3000，只监听本机。

## 已接好的位置

- `server/chat.mjs`：读取后端环境变量，调用 DeepSeek，返回 `{ content }`；请求大小限制 1 MiB，最多 100 条历史消息，AI 请求超时 120 秒。
- `vite.config.ts`：开发代理 `/api` 到 `http://127.0.0.1:3000`。
- `src/ai/aiClient.ts`：前端地址 `/api/chat`，传入历史 messages 和章节 context。

这是非流式回复；取消前端请求会取消上游请求，但已发生的 API 用量不保证免计费。切页关闭窗口后保留页面会话的对话和草稿，刷新后重置。

## 分享与部署

其他人运行源码时，应自行从模板创建 `.env.server.local` 并填写自己的密钥，再启动前后端。分享压缩包时手动排除你的密钥文件；Git 忽略规则不会过滤压缩包。

如果由你统一提供 AI 服务，需要独立部署后端并增加身份认证、限流及额度管理。本示例仅用于本机开发。Vite 开发代理不会随 `dist` 发布，生产环境需配置服务器代理 `/api/chat`。不要把你的密钥打包到网页或桌面安装包中。

## 验证

`node --test server/chat.test.mjs` 使用模拟上游回复，不读取密钥也不消耗 API 额度。真实回复需要用户自行填写密钥后测试。

## 修改 AI 人设与 Markdown

编辑 `server/ai-persona.md` 设置人设、语气、教学方式和输出格式，可以直接用 Markdown 编写。修改后重启 AI 后端，新请求会使用新的人设；旧回复不会自动重写。当前章节由后端自动追加，不必写死在人设里。

`server/chat.mjs` 将该文件作为 `system` 消息发送。`src/ai/MessageContent.tsx` 使用 react-markdown 和 remark-gfm 渲染消息，支持加粗、标题、列表、引用、代码块、表格等。输入框仍是纯文本编辑，发送后显示 Markdown 排版。原始 HTML 不作为网页执行。
