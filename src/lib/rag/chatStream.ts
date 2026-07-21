import type { RagSseEvent } from '@/lib/rag/protocol'

export async function consumeRagChatStream(
  response: Response,
  onEvent: (event: RagSseEvent) => void,
) {
  if (!response.body) throw new Error('AI 助手暂时不可用')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let sawDone = false

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data:')) continue

        const payload = trimmed.slice(5).trim()
        if (!payload) continue

        let event: RagSseEvent
        try {
          event = JSON.parse(payload) as RagSseEvent
        } catch {
          continue
        }

        onEvent(event)
        if (event.type === 'done') {
          sawDone = true
          return
        }
        if (event.type === 'error') throw new Error(event.error)
      }
    }

    if (!sawDone) throw new Error('回答未完整，请重试')
  } finally {
    try {
      await reader.cancel()
    } catch {
      // Cancellation is best effort when the stream already failed or closed.
    } finally {
      reader.releaseLock()
    }
  }
}
