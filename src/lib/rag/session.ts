const RAG_SESSION_STORAGE_KEY = 'tech-centric-rag-session-id'
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type SessionStorage = Pick<Storage, 'getItem' | 'setItem'>

function browserStorage(): SessionStorage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch {
    return undefined
  }
}

export function persistRagSessionId(
  sessionId: string,
  storage: SessionStorage | undefined = browserStorage(),
) {
  if (!UUID_PATTERN.test(sessionId)) return
  try {
    storage?.setItem(RAG_SESSION_STORAGE_KEY, sessionId)
  } catch {
    // Storage can be blocked or full; the in-flight request can still proceed.
  }
}

export function getOrCreateRagSessionId(
  storage: SessionStorage | undefined = browserStorage(),
) {
  try {
    const stored = storage?.getItem(RAG_SESSION_STORAGE_KEY)
    if (stored && UUID_PATTERN.test(stored)) return stored
  } catch {
    // Fall through to an ephemeral session ID.
  }

  const sessionId = crypto.randomUUID()
  persistRagSessionId(sessionId, storage)
  return sessionId
}
