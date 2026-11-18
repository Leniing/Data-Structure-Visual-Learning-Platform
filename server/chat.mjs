import http from 'node:http'
import { readFileSync } from 'node:fs'

// Edit ai-persona.md to change the assistant persona; restart the backend to apply.
const aiPersona = readFileSync(new URL('./ai-persona.md', import.meta.url), 'utf8').trim()
import { pathToFileURL } from 'node:url'

// Local development adapter. Never send the API key to the browser.
export function createChatServer({ apiKey, baseUrl = 'https://api.deepseek.com', model = 'deepseek-flash', fetchImpl = fetch }) {
  const reply = (res, status, data) => {
    if (res.destroyed) return
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
    res.end(JSON.stringify(data))
  }
  return http.createServer(async (req, res) => {
    if (req.url !== '/api/chat' || req.method !== 'POST') return reply(res, 404, { error: '接口不存在' })
    // JSON-only requests prevent cross-origin HTML forms from using this local service.
    if (!req.headers['content-type']?.toLowerCase().startsWith('application/json')) return reply(res, 415, { error: '需要 JSON 请求' })
    if (!apiKey?.trim()) return reply(res, 503, { error: '请配置后端 DEEPSEEK_API_KEY 并重启' })
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 120000)
    const cancel = () => controller.abort()
    res.on('close', cancel)
    try {
      const chunks = []
      let bytes = 0
      for await (const chunk of req) {
        bytes += chunk.length
        if (bytes > 1024 * 1024) return reply(res, 413, { error: '对话内容过长' })
        chunks.push(chunk)
      }
      let body
      try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')) }
      catch { return reply(res, 400, { error: 'JSON 格式不正确' }) }
      const messages = body?.messages
      if (!Array.isArray(messages) || !messages.length || messages.length > 100 || messages.some(message =>
        !message || !['user', 'assistant'].includes(message.role) || typeof message.content !== 'string' || !message.content.trim() || message.content.length > 100000
      )) return reply(res, 400, { error: '对话格式不正确或内容过长' })
      const chapter = typeof body.context?.chapterTitle === 'string' ? body.context.chapterTitle.slice(0, 100) : '数据结构'
      const upstream = await fetchImpl(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model, stream: false, messages: [
          { role: 'system', content: `${aiPersona}\n\n当前学习章节：${chapter}` },
          ...messages.map(({ role, content }) => ({ role, content })),
        ] }),
        signal: controller.signal,
      })
      if (!upstream.ok) {
        const errors = { 401: 'DeepSeek 密钥无效，请检查后端配置', 402: 'DeepSeek 账户余额不足', 429: '请求过于频繁，请稍后重试' }
        return reply(res, 502, { error: errors[upstream.status] || `DeepSeek 请求失败（HTTP ${upstream.status}）` })
      }
      const data = await upstream.json()
      const content = data.choices?.[0]?.message?.content
      if (typeof content !== 'string' || !content.trim()) return reply(res, 502, { error: 'DeepSeek 未返回有效回复' })
      reply(res, 200, { content: content.slice(0, 100000) })
    } catch {
      reply(res, 502, { error: controller.signal.aborted ? '请求已取消或超时，请重试' : '无法连接 DeepSeek，请稍后重试' })
    } finally {
      clearTimeout(timer)
      res.off('close', cancel)
    }
  })
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey?.trim()) {
    console.error('请先在 .env.server.local 填写 DEEPSEEK_API_KEY，再启动后端。')
    process.exitCode = 1
  } else {
    const server = createChatServer({ apiKey, baseUrl: process.env.DEEPSEEK_BASE_URL, model: process.env.DEEPSEEK_MODEL })
    server.on('error', error => {
      console.error(error.code === 'EADDRINUSE' ? '端口 3000 已被占用，请关闭旧的 AI 后端后重试。' : 'AI 后端启动失败。')
      process.exitCode = 1
    })
    server.listen(3000, '127.0.0.1', () => console.log('AI 后端已启动：http://127.0.0.1:3000'))
  }
}
