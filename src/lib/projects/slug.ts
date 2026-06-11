/** 从项目名称生成 URL slug，附短 id 后缀保证唯一 */
export function buildProjectSlug(name: string, id: string): string {
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fff-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  const suffix = id.slice(0, 8)
  if (normalized.length >= 2) {
    return `${normalized}-${suffix}`
  }
  return id
}

export function projectDetailPath(slug: string): string {
  return `/projects/${encodeURIComponent(slug)}`
}
