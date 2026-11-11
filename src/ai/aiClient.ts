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

/** Replace this adapter with an approved service; never put credentials in the browser. */
export const aiClient: AiClient = {
  configured: false,
  async sendMessage() {
    throw new Error('AI 服务尚未接入')
  },
}
