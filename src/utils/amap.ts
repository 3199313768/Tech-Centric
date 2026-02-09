// 高德地图工具函数

declare global {
  interface Window {
    AMap: any
    initAMap: () => void
  }
}

export type MapLayerType = 'normal' | 'satellite' | 'roadnet' | 'hybrid' | 'terrain'

export interface AMapConfig {
  zoom?: number
  center?: [number, number]
  mapStyle?: string
  viewMode?: string
  pitch?: number
  rotation?: number
  layerType?: MapLayerType
}

// 用于生成唯一回调函数名的计数器（避免使用 Date.now() 导致 hydration 错误）
let callbackCounter = 0

/**
 * 加载高德地图 SDK
 */
export function loadAMapScript(apiKey: string): Promise<void> {
  // 确保只在客户端执行
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('高德地图 SDK 只能在客户端加载'))
  }

  return new Promise((resolve, reject) => {
    // 如果已经加载，直接返回
    if (window.AMap) {
      resolve()
      return
    }

    // 如果正在加载，等待加载完成
    const existingScript = document.querySelector('script[src*="webapi.amap.com"]')
    if (existingScript) {
      // 如果已经有回调函数，直接使用
      if (window.AMap) {
        resolve()
        return
      }
      // 否则等待加载完成
      const checkInterval = setInterval(() => {
        if (window.AMap) {
          clearInterval(checkInterval)
          resolve()
        }
      }, 100)

      // 设置超时
      setTimeout(() => {
        clearInterval(checkInterval)
        if (!window.AMap) {
          reject(new Error('高德地图 SDK 加载超时'))
        }
      }, 10000)
      return
    }

    // 生成唯一的回调函数名（使用计数器而不是 Date.now()）
    callbackCounter++
    const callbackName = `amapInitCallback_${callbackCounter}`

      // 设置全局回调
      ; (window as any)[callbackName] = () => {
        // 清理回调函数
        delete (window as any)[callbackName]

        if (window.AMap) {
          resolve()
        } else {
          reject(new Error('高德地图 SDK 加载失败：AMap 对象未找到'))
        }
      }

    // 创建新的 script 标签
    const script = document.createElement('script')
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${apiKey}&callback=${callbackName}`
    script.async = true

    script.onerror = () => {
      delete (window as any)[callbackName]
      reject(new Error('高德地图 SDK 脚本加载失败'))
    }

    // 设置超时
    const timeout = setTimeout(() => {
      delete (window as any)[callbackName]
      if (!window.AMap) {
        reject(new Error('高德地图 SDK 加载超时'))
      }
    }, 10000)

    script.onload = () => {
      clearTimeout(timeout)
      // 如果回调函数没有被调用，检查 AMap 是否已经存在
      setTimeout(() => {
        if (window.AMap) {
          delete (window as any)[callbackName]
          resolve()
        }
      }, 100)
    }

    document.head.appendChild(script)
  })
}

/**
 * 初始化地图实例
 */
export function initMap(container: string | HTMLElement, config: AMapConfig = {}) {
  // 确保只在客户端执行
  if (typeof window === 'undefined' || !window.AMap) {
    throw new Error('高德地图 SDK 未加载')
  }

  const layerType = config.layerType || 'normal'

  const defaultConfig = {
    zoom: config.zoom || 5,
    center: config.center || [104, 35], // 中国中心位置，默认显示地形
    // 使用标准地图样式，显示完整的地理信息（城市名、道路名等）
    mapStyle: layerType === 'normal' ? (config.mapStyle || 'amap://styles/normal') : undefined,
    viewMode: config.viewMode || '3D',
    pitch: config.pitch || 0,
    rotation: config.rotation || 0,
  }

  const map = new window.AMap.Map(container, defaultConfig)

  // 根据图层类型添加图层
  setupMapLayers(map, layerType)

  return map
}

/**
 * 设置地图图层
 */
export function setupMapLayers(map: any, layerType: MapLayerType) {
  // 确保只在客户端执行
  if (typeof window === 'undefined' || !map || !window.AMap) return

  // 清除现有图层（但保留覆盖物）
  const layers = map.getLayers()
  layers.forEach((layer: any) => {
    if (layer instanceof window.AMap.TileLayer) {
      map.remove(layer)
    }
  })

  // 根据类型添加图层
  switch (layerType) {
    case 'satellite':
      map.add(new window.AMap.TileLayer.Satellite())
      break
    case 'roadnet':
      map.add(new window.AMap.TileLayer.RoadNet())
      break
    case 'hybrid':
      // 先添加卫星图层作为底图
      map.add(new window.AMap.TileLayer.Satellite())
      // 再添加路网图层叠加在上方
      map.add(new window.AMap.TileLayer.RoadNet())
      break
    case 'terrain':
      // 添加地形图层
      map.add(new window.AMap.TileLayer.Terrain())
      break
    case 'normal':
    default:
      // 普通地图使用默认样式，不需要额外图层
      break
  }
}

/**
 * 创建自定义标记图标
 */
export function createCustomMarkerIcon(color: string = '#00d9ff') {
  // 确保只在客户端执行
  if (typeof window === 'undefined' || !window.AMap) {
    throw new Error('高德地图 SDK 未加载')
  }

  return new window.AMap.Icon({
    size: new window.AMap.Size(32, 32),
    image: createMarkerImage(color),
    imageSize: new window.AMap.Size(32, 32),
  })
}

/**
 * 创建标记点 SVG 图片
 */
function createMarkerImage(color: string): string {
  // 使用更简单的 SVG，确保兼容性
  const svg = `<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <circle cx="16" cy="16" r="12" fill="${color}" opacity="0.3" filter="url(#glow)"/>
    <circle cx="16" cy="16" r="10" fill="${color}" opacity="0.9"/>
    <circle cx="16" cy="16" r="6" fill="white"/>
  </svg>`

  // 使用 encodeURIComponent 而不是 base64，更可靠
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

/**
 * 计算适合所有标记点的地图视野
 */
export function fitBounds(
  map: any,
  coordinates: Array<{ lat: number; lng: number }>,
  padding: number[] = [50, 50, 50, 50]
) {
  // 确保只在客户端执行
  if (typeof window === 'undefined' || !map || !coordinates || coordinates.length === 0) {
    return
  }

  const bounds = new window.AMap.Bounds()
  coordinates.forEach((coord) => {
    bounds.extend([coord.lng, coord.lat])
  })

  map.setBounds(bounds, false, padding)
}

/**
 * 格式化日期
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
