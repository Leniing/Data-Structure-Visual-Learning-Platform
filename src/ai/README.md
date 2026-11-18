# AI 解答接入

在 `src/ai/aiClient.ts` 修改 `AI_API_ENDPOINT`，填入你自己的后端接口地址。地址为空时仍可编辑输入框，但发送按钮禁用。

接口接收 POST JSON：

```json
{
  "messages": [{ "role": "user", "content": "如何创建单链表？" }],
  "context": { "chapterId": "linked-list-creation", "chapterTitle": "单链表创建", "language": "c" }
}
```

后端返回 JSON：

```json
{ "content": "AI 回复正文" }
```

`messages` 包含当前对话历史，`context` 为当前章节。后端负责调用 AI 提供商并映射返回内容；密钥只保存在后端，不要写入前端代码。跨域接口需在后端允许当前页面来源。同源 `/api/chat` 需要由你的服务或开发代理提供，本项目未添加后端。

如果已有接口返回格式不同，在同文件的 `sendMessage` 中调整请求体和响应解析。当前采用一次性 JSON 响应，不解析流式 SSE；支持取消请求、停止生成和失败重试。

页面跳转后窗口自动关闭；重新打开保留本次页面会话的记录和草稿。刷新网页后重置记录。
