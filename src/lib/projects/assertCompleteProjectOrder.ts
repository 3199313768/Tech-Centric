/** 校验全量有序 id 与库中集合完全一致。 */
export function assertCompleteProjectOrder(
  orderedIds: string[],
  existingIds: string[],
): string | null {
  if (orderedIds.length !== existingIds.length) {
    return '排序列表与项目数量不一致'
  }
  if (new Set(orderedIds).size !== orderedIds.length) {
    return '排序列表包含重复项'
  }
  const existing = new Set(existingIds)
  for (const id of orderedIds) {
    if (!existing.has(id)) return '排序列表包含未知项目'
  }
  return null
}
