/**
 * 将「当前可见列表」的新相对次序嵌回全量 id 序列。
 * 不可见项保持占位；可见项按 visibleOrderedIds 依次填入。
 */
export function mergeVisibleOrder(
  fullIds: string[],
  visibleOrderedIds: string[],
): string[] {
  if (new Set(visibleOrderedIds).size !== visibleOrderedIds.length) {
    throw new Error('visibleOrderedIds must not contain duplicates')
  }

  const fullSet = new Set(fullIds)
  for (const id of visibleOrderedIds) {
    if (!fullSet.has(id)) {
      throw new Error('visibleOrderedIds must be a subset of fullIds')
    }
  }

  const visibleSet = new Set(visibleOrderedIds)
  let cursor = 0
  return fullIds.map((id) => {
    if (!visibleSet.has(id)) return id
    const next = visibleOrderedIds[cursor]
    cursor += 1
    return next
  })
}
