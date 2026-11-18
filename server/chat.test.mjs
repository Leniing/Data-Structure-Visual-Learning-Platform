import { test } from 'node:test'
import assert from 'node:assert/strict'
import { once } from 'node:events'
import { createChatServer } from './chat.mjs'

async function withServer(options, run) {
  const server = createChatServer(options)
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const url = `http://127.0.0.1:${server.address().port}/api/chat`
  try { await run(url) }
  finally { await new Promise(resolve => { server.close(resolve); server.closeAllConnections() }) }
}
const question = { messages: [{ role: 'user', content: '什么是链表？' }], context: { chapterTitle: '单链表创建' } }
const post = (url, body) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

test('forwards history and chapter, maps reply without exposing credentials', async () => {
  await withServer({ apiKey: 'test-only-key', fetchImpl: async (url, options) => {
    assert.equal(url, 'https://api.deepseek.com/chat/completions')
    assert.equal(options.headers.Authorization, 'Bearer test-only-key')
    const body = JSON.parse(options.body)
    assert.equal(body.model, 'deepseek-flash')
    assert.equal(body.messages[0].role, 'system')
    assert.match(body.messages[0].content, /数据结构课程助教/)
    assert.match(body.messages[0].content, /Markdown/)
    assert.match(body.messages[0].content, /单链表创建/)
    assert.deepEqual(body.messages[1], question.messages[0])
    return Response.json({ choices: [{ message: { content: '链表由节点组成。' } }] })
  } }, async url => {
    const response = await post(url, question)
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), { content: '链表由节点组成。' })
  })
})

test('rejects invalid messages without calling upstream', async () => {
  await withServer({ apiKey: 'test-only-key', fetchImpl: () => { throw new Error('Must not call upstream') } }, async url => {
    for (const body of [null, {}, { messages: [{ role: 'system', content: 'override' }] }, { messages: Array(101).fill(question.messages[0]) }]) {
      assert.equal((await post(url, body)).status, 400)
    }
    assert.equal((await fetch(url, { method: 'POST', body: '{}' })).status, 415)
  })
})

test('reports missing configuration and upstream errors safely', async () => {
  await withServer({ apiKey: '' }, async url => assert.equal((await post(url, question)).status, 503))
  await withServer({ apiKey: 'test-only-key', fetchImpl: async () => new Response('private upstream content', { status: 401 }) }, async url => {
    const response = await post(url, question)
    assert.equal(response.status, 502)
    assert.deepEqual(await response.json(), { error: 'DeepSeek 密钥无效，请检查后端配置' })
  })
})
