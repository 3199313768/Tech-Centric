'use client'

import { useState, useRef } from 'react'
import { TravelLocation } from '@/data/personal'

interface ImportResult {
  success: boolean
  message: string
  data?: TravelLocation[]
  errors?: string[]
}

export function TravelDataImporter({
  onImport,
}: {
  onImport: (data: TravelLocation[]) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [result, setResult] = useState<ImportResult | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 验证导入数据格式
  const validateData = (data: any): ImportResult => {
    if (!Array.isArray(data)) {
      return {
        success: false,
        message: '数据格式错误：必须是数组格式',
      }
    }

    const errors: string[] = []
    const validData: TravelLocation[] = []

    data.forEach((item, index) => {
      const itemErrors: string[] = []

      if (!item.name || typeof item.name !== 'string') {
        itemErrors.push('缺少 name 字段或格式错误')
      }

      if (!item.location || typeof item.location !== 'string') {
        itemErrors.push('缺少 location 字段或格式错误')
      }

      if (!item.coordinates) {
        itemErrors.push('缺少 coordinates 字段')
      } else {
        if (
          typeof item.coordinates.lat !== 'number' ||
          typeof item.coordinates.lng !== 'number'
        ) {
          itemErrors.push('coordinates 格式错误，需要 { lat: number, lng: number }')
        }
        if (
          item.coordinates.lat < -90 ||
          item.coordinates.lat > 90 ||
          item.coordinates.lng < -180 ||
          item.coordinates.lng > 180
        ) {
          itemErrors.push('坐标超出有效范围')
        }
      }

      if (!item.date || typeof item.date !== 'string') {
        itemErrors.push('缺少 date 字段或格式错误')
      } else {
        const date = new Date(item.date)
        if (isNaN(date.getTime())) {
          itemErrors.push('date 格式错误，需要有效的日期字符串')
        }
      }

      if (!item.description || typeof item.description !== 'string') {
        itemErrors.push('缺少 description 字段或格式错误')
      }

      if (itemErrors.length > 0) {
        errors.push(`第 ${index + 1} 条数据：${itemErrors.join('; ')}`)
      } else {
        validData.push({
          id: item.id || `imported-${Date.now()}-${index}`,
          name: item.name,
          location: item.location,
          coordinates: {
            lat: item.coordinates.lat,
            lng: item.coordinates.lng,
          },
          date: item.date,
          description: item.description,
          tags: item.tags || [],
          image: item.image,
        })
      }
    })

    if (errors.length > 0) {
      return {
        success: false,
        message: `数据验证失败，发现 ${errors.length} 处错误`,
        errors,
      }
    }

    return {
      success: true,
      message: `成功导入 ${validData.length} 条数据`,
      data: validData,
    }
  }

  // 处理导入
  const handleImport = () => {
    if (!importText.trim()) {
      setResult({
        success: false,
        message: '请输入或上传 JSON 数据',
      })
      return
    }

    setIsImporting(true)

    try {
      const parsedData = JSON.parse(importText)
      const validationResult = validateData(parsedData)

      setResult(validationResult)

      if (validationResult.success && validationResult.data) {
        // 延迟执行导入，让用户看到成功消息
        setTimeout(() => {
          onImport(validationResult.data!)
          setIsOpen(false)
          setImportText('')
          setResult(null)
        }, 1000)
      }
    } catch (error) {
      setResult({
        success: false,
        message: `JSON 解析失败：${error instanceof Error ? error.message : '未知错误'}`,
      })
    } finally {
      setIsImporting(false)
    }
  }

  // 处理文件上传
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setImportText(text)
    }
    reader.onerror = () => {
      setResult({
        success: false,
        message: '文件读取失败',
      })
    }
    reader.readAsText(file)
  }

  // 下载数据模板
  const downloadTemplate = () => {
    const template: TravelLocation[] = [
      {
        id: 'template-1',
        name: '示例城市',
        location: '中国 省份',
        coordinates: {
          lat: 39.9042,
          lng: 116.4074,
        },
        date: '2024-01-01',
        description: '这是一个示例描述',
        tags: ['示例', '标签'],
      },
    ]

    const blob = new Blob([JSON.stringify(template, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'travel-data-template.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // 清空输入
  const handleClear = () => {
    setImportText('')
    setResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: '12px 24px',
          border: '1px solid rgba(0, 217, 255, 0.3)',
          backgroundColor: 'rgba(0, 217, 255, 0.05)',
          color: '#00d9ff',
          borderRadius: '8px',
          cursor: 'pointer',
          fontFamily: 'var(--font-space-mono), monospace',
          fontSize: '14px',
          transition: 'all 0.3s ease',
          marginBottom: '24px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.6)'
          e.currentTarget.style.backgroundColor = 'rgba(0, 217, 255, 0.1)'
          e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 217, 255, 0.3)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.3)'
          e.currentTarget.style.backgroundColor = 'rgba(0, 217, 255, 0.05)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        导入旅行数据
      </button>
    )
  }

  return (
    <div
      style={{
        padding: '24px',
        border: '1px solid rgba(0, 217, 255, 0.3)',
        backgroundColor: 'rgba(0, 217, 255, 0.05)',
        borderRadius: '8px',
        marginBottom: '24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h3
          style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#00d9ff',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            margin: 0,
          }}
        >
          导入旅行数据
        </h3>
        <button
          onClick={() => {
            setIsOpen(false)
            setImportText('')
            setResult(null)
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.6)',
            cursor: 'pointer',
            fontSize: '24px',
            padding: '0',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ×
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '16px',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={downloadTemplate}
          style={{
            padding: '8px 16px',
            border: '1px solid rgba(0, 217, 255, 0.3)',
            backgroundColor: 'rgba(0, 217, 255, 0.05)',
            color: '#00d9ff',
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'var(--font-space-mono), monospace',
            fontSize: '12px',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.6)'
            e.currentTarget.style.backgroundColor = 'rgba(0, 217, 255, 0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.3)'
            e.currentTarget.style.backgroundColor = 'rgba(0, 217, 255, 0.05)'
          }}
        >
          下载模板
        </button>
        <label
          style={{
            padding: '8px 16px',
            border: '1px solid rgba(0, 217, 255, 0.3)',
            backgroundColor: 'rgba(0, 217, 255, 0.05)',
            color: '#00d9ff',
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'var(--font-space-mono), monospace',
            fontSize: '12px',
            transition: 'all 0.3s ease',
            display: 'inline-block',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.6)'
            e.currentTarget.style.backgroundColor = 'rgba(0, 217, 255, 0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.3)'
            e.currentTarget.style.backgroundColor = 'rgba(0, 217, 255, 0.05)'
          }}
        >
          上传文件
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </label>
        <button
          onClick={handleClear}
          style={{
            padding: '8px 16px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backgroundColor: 'transparent',
            color: 'rgba(255, 255, 255, 0.6)',
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'var(--font-space-mono), monospace',
            fontSize: '12px',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)'
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'
          }}
        >
          清空
        </button>
      </div>

      <textarea
        value={importText}
        onChange={(e) => setImportText(e.target.value)}
        placeholder="请粘贴 JSON 数据或上传 JSON 文件..."
        style={{
          width: '100%',
          minHeight: '200px',
          padding: '12px',
          border: '1px solid rgba(0, 217, 255, 0.3)',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          color: '#fff',
          borderRadius: '4px',
          fontFamily: 'var(--font-jetbrains-mono), monospace',
          fontSize: '12px',
          resize: 'vertical',
          marginBottom: '16px',
        }}
      />

      {result && (
        <div
          style={{
            padding: '12px',
            marginBottom: '16px',
            borderRadius: '4px',
            backgroundColor: result.success
              ? 'rgba(34, 197, 94, 0.1)'
              : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${
              result.success
                ? 'rgba(34, 197, 94, 0.3)'
                : 'rgba(239, 68, 68, 0.3)'
            }`,
            color: result.success ? '#22c55e' : '#ef4444',
            fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
            fontSize: '14px',
          }}
        >
          <div style={{ marginBottom: result.errors ? '8px' : '0' }}>
            {result.message}
          </div>
          {result.errors && result.errors.length > 0 && (
            <div
              style={{
                marginTop: '8px',
                paddingTop: '8px',
                borderTop: `1px solid ${
                  result.success
                    ? 'rgba(34, 197, 94, 0.2)'
                    : 'rgba(239, 68, 68, 0.2)'
                }`,
                fontSize: '12px',
                maxHeight: '150px',
                overflowY: 'auto',
              }}
            >
              {result.errors.map((error, index) => (
                <div key={index} style={{ marginBottom: '4px' }}>
                  • {error}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button
          onClick={() => {
            setIsOpen(false)
            setImportText('')
            setResult(null)
          }}
          style={{
            padding: '8px 16px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backgroundColor: 'transparent',
            color: 'rgba(255, 255, 255, 0.6)',
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'var(--font-space-mono), monospace',
            fontSize: '12px',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)'
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'
          }}
        >
          取消
        </button>
        <button
          onClick={handleImport}
          disabled={isImporting || !importText.trim()}
          style={{
            padding: '8px 16px',
            border: '1px solid rgba(0, 217, 255, 0.3)',
            backgroundColor: isImporting || !importText.trim()
              ? 'rgba(0, 217, 255, 0.1)'
              : 'rgba(0, 217, 255, 0.2)',
            color: isImporting || !importText.trim()
              ? 'rgba(0, 217, 255, 0.5)'
              : '#00d9ff',
            borderRadius: '4px',
            cursor: isImporting || !importText.trim() ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-space-mono), monospace',
            fontSize: '12px',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            if (!isImporting && importText.trim()) {
              e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.6)'
              e.currentTarget.style.backgroundColor = 'rgba(0, 217, 255, 0.3)'
            }
          }}
          onMouseLeave={(e) => {
            if (!isImporting && importText.trim()) {
              e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.3)'
              e.currentTarget.style.backgroundColor = 'rgba(0, 217, 255, 0.2)'
            }
          }}
        >
          {isImporting ? '导入中...' : '导入数据'}
        </button>
      </div>
    </div>
  )
}
