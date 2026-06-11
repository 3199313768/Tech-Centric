'use client'

import { motion } from 'framer-motion'
import type { ResourceItem } from '@/data/resources/initialResources'

interface ResourceDiscoveryModalProps {
  isOpen: boolean
  isMobile: boolean
  modalPad: string
  overlayPad: string
  discoveredItems: ResourceItem[]
  onClose: () => void
  onAddToLibrary: (item: ResourceItem) => void
  onRemoveItem: (item: ResourceItem) => void
}

export function ResourceDiscoveryModal({
  isOpen,
  isMobile,
  modalPad,
  overlayPad,
  discoveredItems,
  onClose,
  onAddToLibrary,
  onRemoveItem,
}: ResourceDiscoveryModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="sg-resource-modal-shell"
      style={{ zIndex: 1500, padding: overlayPad }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="sg-resource-modal-panel"
        style={{
          maxWidth: '800px',
          maxHeight: isMobile ? '88dvh' : '80vh',
          padding: modalPad,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="sg-resource-discovery-head"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: isMobile ? '20px' : '32px',
            gap: '12px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--color-cyan)', margin: '0 0 8px' }}>
              ✨ AI 发现灵感
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>
              基于高级前端趋势为您探测到的新物种
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭发现弹窗"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              fontSize: '24px',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {discoveredItems.map((item) => (
            <div
              key={item.id}
              className="sg-resource-discovery-item"
              style={{
                padding: isMobile ? '16px' : '24px',
                borderRadius: '12px',
                border: '1px solid var(--color-ai-card-border)',
                background: 'rgba(255,255,255,0.03)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'stretch' : 'center',
                gap: isMobile ? '12px' : '20px',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      background: 'rgba(180, 58, 36, 0.1)',
                      color: 'var(--color-cyan)',
                      borderRadius: '4px',
                      border: '1px solid var(--color-cyan-30)',
                      fontWeight: 600,
                    }}
                  >
                    {(item as ResourceItem & { source?: string }).source || 'AI 发现'}
                  </span>
                  <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{item.name}</h4>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: '0 0 12px', lineHeight: 1.5 }}>
                  {item.description}
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {item.tags?.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: '11px',
                        padding: '2px 6px',
                        background: 'var(--color-ai-tag-bg)',
                        border: '1px solid var(--color-ai-tag-border)',
                        borderRadius: '4px',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div
                className="sg-resource-discovery-actions"
                style={{ display: 'flex', gap: '8px', flexDirection: isMobile ? 'row' : 'column' }}
              >
                <button
                  type="button"
                  onClick={() => onAddToLibrary(item)}
                  style={{
                    padding: isMobile ? '10px 14px' : '8px 16px',
                    minHeight: 'var(--sg-touch-min)',
                    borderRadius: '6px',
                    background: 'var(--color-cyan-10)',
                    border: '1px solid var(--color-cyan-50)',
                    color: 'var(--color-cyan)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  加入库
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveItem(item)}
                  style={{
                    padding: isMobile ? '10px 14px' : '8px 16px',
                    minHeight: 'var(--sg-touch-min)',
                    borderRadius: '6px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: 'var(--color-red, #ef4444)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  移除
                </button>
              </div>
            </div>
          ))}
        </div>

        {discoveredItems.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '40px' }}>
            正在为您连接趋势引擎...
          </p>
        ) : null}
      </motion.div>
    </div>
  )
}
