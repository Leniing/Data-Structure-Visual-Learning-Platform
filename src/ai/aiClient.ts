export interface AiContext {
  chapterId: string
  chapterTitle: string
  language?: string
}

export interface AiMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export interface AiRequest {
  messages: readonly AiMessage[]
  context: Readonly<AiContext>
  signal: AbortSignal
}

export interface AiClient {
  configured: boolean
  sendMessage(request: AiRequest): Promise<string>
}

/** API 接入点：填写你自己的后端地址，例如 '/api/chat'。
 * 请求：{ messages: [{ role, content }], context: { chapterId, chapterTitle, language } }
 * 响应：{ content: 'AI 回复正文' }。第三方 API 密钥应由后端保存。
 */
export const AI_API_ENDPOINT: string = '/api/chat'

export const aiClient: AiClient = {
  configured: Boolean(AI_API_ENDPOINT),
  async sendMessage({ messages, context, signal }) {
    if (!AI_API_ENDPOINT) throw new Error('请先配置 AI_API_ENDPOINT')
    const response = await fetch(AI_API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messages.map(({ role, content }) => ({ role, content })), context }),
      signal,
    })
    if (!response.ok) {
      const failure: unknown = await response.json().catch(() => null)
      const message = failure && typeof failure === 'object' && 'error' in failure && typeof failure.error === 'string'
        ? failure.error.slice(0, 300) : `发送失败（HTTP ${response.status}），请确认 AI 后端已启动`
      throw new Error(message)
    }
    const data: unknown = await response.json()
    if (!data || typeof data !== 'object' || !('content' in data) || typeof data.content !== 'string') {
      throw new Error('AI 接口响应格式不正确：需要 { content: "回复正文" }')
    }
    return data.content
  },
}
