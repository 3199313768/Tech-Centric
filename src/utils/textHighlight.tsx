'use client'

import { ReactNode } from 'react'

// 关键词分类和样式定义
export const keywordCategories = {
  tech: {
    keywords: [
      'React/Next.js',
      'Next.js App Router',
      'React Hooks',
      'React',
      'Next.js',
      'App Router',
      'CSS动画',
      'WebGL',
      '性能优化',
      '动画交互',
      '组件库',
      'UI组件库',
      'Web开发',
      '前端开发',
      '技术博客',
      '开源项目',
    ],
    style: {
      color: 'var(--color-cyan)',
      textShadow: '0 0 10px var(--color-cyan-glow)',
      fontWeight: 600,
    },
  },
  concept: {
    keywords: [
      '用户体验',
      '设计思维',
      '技术深度',
      '美学表达',
      '视觉表现力',
      '交互流畅度',
      '微交互',
      '视觉节奏',
      '情感连接',
      '技术实现',
      '设计美感',
    ],
    style: {
      color: 'var(--color-highlight-gold)',
      textShadow: '0 0 8px var(--color-highlight-gold-glow)',
      fontWeight: 600,
    },
  },
  personal: {
    keywords: ['Oxygen', '氧气', '3-5年', '前端开发工程师'],
    style: {
      color: 'var(--color-highlight-pink)',
      textShadow: '0 0 10px var(--color-highlight-pink-glow)',
      fontWeight: 700,
      fontStyle: 'italic',
    },
  },
}

// 高亮文本中的关键词
export function highlightKeywords(text: string): ReactNode[] {
  // 合并所有关键词并按长度排序（长的优先匹配）
  const allKeywords: Array<{ keyword: string; style: React.CSSProperties }> = []
  
  Object.values(keywordCategories).forEach((category) => {
    category.keywords.forEach((keyword) => {
      allKeywords.push({
        keyword,
        style: category.style,
      })
    })
  })

  // 按长度降序排序，确保长关键词优先匹配
  allKeywords.sort((a, b) => b.keyword.length - a.keyword.length)

  const parts: Array<{ text: string; highlighted: boolean; style?: React.CSSProperties }> = []
  const remainingText = text

  // 查找所有匹配的关键词位置
  const matches: Array<{ start: number; end: number; style: React.CSSProperties }> = []

  allKeywords.forEach(({ keyword, style }) => {
    let searchIndex = 0
    while (true) {
      const index = remainingText.indexOf(keyword, searchIndex)
      if (index === -1) break

      // 检查是否与已有匹配重叠
      const overlaps = matches.some(
        (match) =>
          (index >= match.start && index < match.end) ||
          (index + keyword.length > match.start && index + keyword.length <= match.end) ||
          (index <= match.start && index + keyword.length >= match.end)
      )

      if (!overlaps) {
        matches.push({
          start: index,
          end: index + keyword.length,
          style,
        })
      }

      searchIndex = index + 1
    }
  })

  // 按开始位置排序
  matches.sort((a, b) => a.start - b.start)

  // 构建结果数组
  let currentIndex = 0
  matches.forEach((match) => {
    // 添加匹配前的普通文本
    if (match.start > currentIndex) {
      parts.push({
        text: remainingText.substring(currentIndex, match.start),
        highlighted: false,
      })
    }

    // 添加高亮的关键词
    parts.push({
      text: remainingText.substring(match.start, match.end),
      highlighted: true,
      style: match.style,
    })

    currentIndex = match.end
  })

  // 添加剩余的文本
  if (currentIndex < remainingText.length) {
    parts.push({
      text: remainingText.substring(currentIndex),
      highlighted: false,
    })
  }

  // 如果没有匹配，返回原始文本
  if (parts.length === 0) {
    parts.push({ text: remainingText, highlighted: false })
  }

  // 转换为 React 节点
  return parts.map((part, index) => {
    if (part.highlighted && part.style) {
      return (
        <span key={index} style={part.style}>
          {part.text}
        </span>
      )
    }
    return <span key={index}>{part.text}</span>
  })
}
