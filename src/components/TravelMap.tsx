'use client'

import { useState, useEffect, useRef } from 'react'
import { travelLocations, TravelLocation } from '@/data/personal'
import { loadAMapScript, initMap, createCustomMarkerIcon, fitBounds, formatDate, setupMapLayers, MapLayerType } from '@/utils/amap'
import { TravelDataImporter } from './TravelDataImporter'

export function TravelMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const polylinesRef = useRef<any[]>([])
  const infoWindowRef = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [showList, setShowList] = useState(true)
  const [importedLocations, setImportedLocations] = useState<TravelLocation[]>([])
  const [mapError, setMapError] = useState<string | null>(null)
  const [mapType, setMapType] = useState<MapLayerType>('terrain')
  const [isMounted, setIsMounted] = useState(false)

  // 合并原始数据和导入的数据
  const allLocations = [...travelLocations, ...importedLocations]

  const apiKey = process.env.NEXT_PUBLIC_AMAP_KEY || ''

  // 确保只在客户端渲染地图
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // 显示地点信息窗口
  const showLocationInfo = (map: any, location: TravelLocation, marker: any) => {
    if (!map || !window.AMap) return

    // 关闭之前的信息窗口
    if (infoWindowRef.current) {
      infoWindowRef.current.close()
    }

    // 创建信息窗口内容
    const content = `
      <div style="
        color: #fff;
        font-family: var(--font-geist-sans), system-ui, sans-serif;
        padding: 0;
        min-width: 250px;
        background: transparent;
      ">
        <div style="
          background: rgba(10, 10, 10, 0.95);
          border: 1px solid rgba(0, 217, 255, 0.3);
          border-radius: 8px;
          padding: 20px;
          backdrop-filter: blur(10px);
        ">
          <h3 style="
            font-size: 20px;
            font-weight: bold;
            color: #00d9ff;
            margin: 0 0 12px 0;
            font-family: var(--font-geist-sans), system-ui, sans-serif;
          ">${location.name}</h3>
          <p style="
            font-size: 14px;
            color: rgba(255, 255, 255, 0.7);
            margin: 0 0 8px 0;
            font-family: var(--font-geist-sans), system-ui, sans-serif;
          ">${location.location}</p>
          <p style="
            font-size: 12px;
            color: rgba(255, 255, 255, 0.5);
            margin: 0 0 12px 0;
            font-family: var(--font-space-mono), monospace;
          ">${formatDate(location.date)}</p>
          <p style="
            font-size: 14px;
            color: rgba(255, 255, 255, 0.85);
            line-height: 1.6;
            margin: 0 0 12px 0;
            font-family: var(--font-geist-sans), system-ui, sans-serif;
          ">${location.description}</p>
          ${location.tags && location.tags.length > 0
        ? `<div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px;">
                  ${location.tags
          .map(
            (tag: string) => `
                    <span style="
                      font-size: 11px;
                      color: rgba(255, 255, 255, 0.6);
                      font-family: var(--font-space-mono), monospace;
                      padding: 2px 8px;
                      background-color: rgba(0, 217, 255, 0.1);
                      border-radius: 4px;
                    ">#${tag}</span>
                  `
          )
          .join('')}
                </div>`
        : ''
      }
        </div>
      </div>
    `

    // 创建信息窗口
    const infoWindow = new window.AMap.InfoWindow({
      content: content,
      offset: new window.AMap.Pixel(0, -30),
      closeWhenClickMap: true,
    })

    infoWindow.open(map, marker.getPosition())
    infoWindowRef.current = infoWindow
  }

  // 设置地图功能：标记点、路线、信息窗口
  const setupMapFeatures = (map: any) => {
    if (!map || !window.AMap) return

    // 清除之前的标记和路线
    markersRef.current.forEach((marker) => marker.setMap(null))
    polylinesRef.current.forEach((polyline) => polyline.setMap(null))
    markersRef.current = []
    polylinesRef.current = []

    // 创建自定义图标
    const markerIcon = createCustomMarkerIcon('#00d9ff')

    // 按时间排序地点（使用合并后的数据）
    const sortedLocations = [...allLocations].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    // 创建标记点
    sortedLocations.forEach((location) => {
      const marker = new window.AMap.Marker({
        position: [location.coordinates.lng, location.coordinates.lat],
        icon: markerIcon,
        title: location.name,
        extData: location,
      })

      // 绑定点击事件
      marker.on('click', () => {
        showLocationInfo(map, location, marker)
        setSelectedLocation(location.id)
      })

      marker.setMap(map)
      markersRef.current.push(marker)
    })

    // 创建路线连接
    if (sortedLocations.length > 1) {
      const path = sortedLocations.map((loc) => [
        loc.coordinates.lng,
        loc.coordinates.lat,
      ])

      const polyline = new window.AMap.Polyline({
        path: path,
        isOutline: true,
        outlineColor: '#00d9ff',
        borderWeight: 2,
        strokeColor: '#00d9ff',
        strokeOpacity: 0.6,
        strokeWeight: 3,
        lineJoin: 'round',
        lineCap: 'round',
        zIndex: 50,
      })

      // 添加箭头
      polyline.setOptions({
        showDir: true,
        dirColor: '#00d9ff',
      })

      polyline.setMap(map)
      polylinesRef.current.push(polyline)
    }

    // 自动适应视野（使用合并后的数据）
    fitBounds(map, allLocations.map((loc) => loc.coordinates), [80, 80, 80, 80])
  }

  // 加载高德地图 SDK 并初始化地图
  useEffect(() => {
    // 确保只在客户端执行
    if (!isMounted) return

    if (!apiKey) {
      console.error('高德地图 API Key 未配置')
      setMapError('高德地图 API Key 未配置')
      return
    }

    let mounted = true

    const initAMap = async () => {
      try {
        setMapError(null)

        // 加载 SDK
        await loadAMapScript(apiKey)

        if (!mounted || !mapContainerRef.current) return

        // 初始化地图 - 定位到中国中心，合适的缩放级别以显示地形
        // 如果有地点数据，先计算中心点和合适的缩放级别
        let initialZoom = 5
        let initialCenter: [number, number] = [104, 35] // 中国中心位置
        
        if (allLocations.length > 0) {
          // 计算所有地点的中心点
          const avgLat = allLocations.reduce((sum, loc) => sum + loc.coordinates.lat, 0) / allLocations.length
          const avgLng = allLocations.reduce((sum, loc) => sum + loc.coordinates.lng, 0) / allLocations.length
          initialCenter = [avgLng, avgLat]
          initialZoom = 6 // 稍微放大以显示地形细节
        }
        
        const map = initMap(mapContainerRef.current, {
          zoom: initialZoom,
          center: initialCenter,
          layerType: mapType,
        })

        mapInstanceRef.current = map

        // 添加地图控件
        try {
          map.addControl(new window.AMap.Scale())
          map.addControl(new window.AMap.ToolBar({
            position: 'RT',
          }))
        } catch (controlError) {
          console.warn('地图控件添加失败:', controlError)
        }

        setMapLoaded(true)

        // 等待地图加载完成
        map.on('complete', () => {
          if (mounted) {
            setupMapFeatures(map)
            // 确保地图视野适应所有地点，显示地形
            if (allLocations.length > 0) {
              fitBounds(map, allLocations.map((loc) => loc.coordinates), [80, 80, 80, 80])
            }
          }
        })
      } catch (error) {
        console.error('地图初始化失败:', error)
        const errorMessage = error instanceof Error ? error.message : '地图加载失败，请检查网络连接和 API Key 配置'
        setMapError(errorMessage)
        setMapLoaded(false)
      }
    }

    initAMap()

    return () => {
      mounted = false
      // 清理资源
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy()
        mapInstanceRef.current = null
      }
      markersRef.current = []
      polylinesRef.current = []
      if (infoWindowRef.current) {
        infoWindowRef.current.close()
        infoWindowRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey, isMounted])

  // 当地点数据变化时，更新地图
  useEffect(() => {
    if (mapLoaded && mapInstanceRef.current) {
      setupMapFeatures(mapInstanceRef.current)
    }
  }, [mapLoaded, importedLocations, allLocations])

  // 当地图类型变化时，更新图层
  useEffect(() => {
    if (mapLoaded && mapInstanceRef.current) {
      setupMapLayers(mapInstanceRef.current, mapType)
    }
  }, [mapType, mapLoaded])

  // 处理数据导入
  const handleImport = (data: TravelLocation[]) => {
    setImportedLocations(data)
  }

  // 切换地图类型
  const switchMapType = (type: MapLayerType) => {
    // 确保只在客户端执行
    if (typeof window === 'undefined' || !mapInstanceRef.current || !window.AMap) return

    setMapType(type)
    const map = mapInstanceRef.current

    // 切换图层（保留标记点和路线）
    setupMapLayers(map, type)
  }

  // 切换列表显示
  const toggleListView = () => {
    setShowList(!showList)
  }

  // 从列表点击跳转到地图标记
  const focusOnLocation = (locationId: string) => {
    const location = allLocations.find((loc) => loc.id === locationId)
    if (!location || !mapInstanceRef.current) return

    const map = mapInstanceRef.current
    map.setZoomAndCenter(12, [location.coordinates.lng, location.coordinates.lat])

    // 找到对应的标记并显示信息窗口
    const marker = markersRef.current.find(
      (m) => m.getExtData()?.id === locationId
    )
    if (marker) {
      showLocationInfo(map, location, marker)
    }

    setSelectedLocation(locationId)
  }

  return (
    <div
      style={{
        padding: '120px 40px 80px',
        maxWidth: '1400px',
        margin: '0 auto',
        color: '#fff',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '48px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 'bold',
            margin: 0,
            fontFamily: 'var(--font-space-mono), monospace',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: '#00d9ff',
            textShadow: '0 0 20px rgba(0, 217, 255, 0.5)',
          }}
        >
          旅行地图
        </h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <TravelDataImporter onImport={handleImport} />
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => switchMapType('terrain')}
              style={{
                padding: '8px 16px',
                border: `1px solid ${mapType === 'terrain' ? 'rgba(0, 217, 255, 0.8)' : 'rgba(0, 217, 255, 0.3)'}`,
                backgroundColor: mapType === 'terrain' ? 'rgba(0, 217, 255, 0.15)' : 'rgba(0, 217, 255, 0.05)',
                color: '#00d9ff',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'var(--font-space-mono), monospace',
                fontSize: '12px',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                if (mapType !== 'terrain') {
                  e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.6)'
                  e.currentTarget.style.backgroundColor = 'rgba(0, 217, 255, 0.1)'
                }
              }}
              onMouseLeave={(e) => {
                if (mapType !== 'terrain') {
                  e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.3)'
                  e.currentTarget.style.backgroundColor = 'rgba(0, 217, 255, 0.05)'
                }
              }}
            >
              地形图
            </button>
            <button
              onClick={() => switchMapType('normal')}
              style={{
                padding: '8px 16px',
                border: `1px solid ${mapType === 'normal' ? 'rgba(0, 217, 255, 0.8)' : 'rgba(0, 217, 255, 0.3)'}`,
                backgroundColor: mapType === 'normal' ? 'rgba(0, 217, 255, 0.15)' : 'rgba(0, 217, 255, 0.05)',
                color: '#00d9ff',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'var(--font-space-mono), monospace',
                fontSize: '12px',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                if (mapType !== 'normal') {
                  e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.6)'
                  e.currentTarget.style.backgroundColor = 'rgba(0, 217, 255, 0.1)'
                }
              }}
              onMouseLeave={(e) => {
                if (mapType !== 'normal') {
                  e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.3)'
                  e.currentTarget.style.backgroundColor = 'rgba(0, 217, 255, 0.05)'
                }
              }}
            >
              标准图
            </button>
            <button
              onClick={() => switchMapType('satellite')}
              style={{
                padding: '8px 16px',
                border: `1px solid ${mapType === 'satellite' ? 'rgba(0, 217, 255, 0.8)' : 'rgba(0, 217, 255, 0.3)'}`,
                backgroundColor: mapType === 'satellite' ? 'rgba(0, 217, 255, 0.15)' : 'rgba(0, 217, 255, 0.05)',
                color: '#00d9ff',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'var(--font-space-mono), monospace',
                fontSize: '12px',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                if (mapType !== 'satellite') {
                  e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.6)'
                  e.currentTarget.style.backgroundColor = 'rgba(0, 217, 255, 0.1)'
                }
              }}
              onMouseLeave={(e) => {
                if (mapType !== 'satellite') {
                  e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.3)'
                  e.currentTarget.style.backgroundColor = 'rgba(0, 217, 255, 0.05)'
                }
              }}
            >
              卫星图
            </button>
          </div>
          <button
            onClick={toggleListView}
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
            {showList ? '隐藏列表' : '显示列表'}
          </button>
        </div>
      </div>

      {/* 统计信息 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px',
          marginBottom: '48px',
        }}
      >
        <div
          style={{
            padding: '20px',
            border: '1px solid rgba(0, 217, 255, 0.3)',
            backgroundColor: 'rgba(0, 217, 255, 0.05)',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#00d9ff',
              fontFamily: 'var(--font-space-mono), monospace',
              marginBottom: '8px',
            }}
          >
            {allLocations.length}
          </div>
          <div
            style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.6)',
              fontFamily: 'var(--font-space-mono), monospace',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            已到访城市
          </div>
        </div>
        <div
          style={{
            padding: '20px',
            border: '1px solid rgba(0, 217, 255, 0.3)',
            backgroundColor: 'rgba(0, 217, 255, 0.05)',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#00d9ff',
              fontFamily: 'var(--font-space-mono), monospace',
              marginBottom: '8px',
            }}
          >
            {new Set(allLocations.map((loc) => loc.location.split(' ')[0])).size}
          </div>
          <div
            style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.6)',
              fontFamily: 'var(--font-space-mono), monospace',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            不同省份
          </div>
        </div>
      </div>

      {/* 地图容器 */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          marginBottom: '48px',
        }}
      >
        <div
          ref={mapContainerRef}
          style={{
            width: '100%',
            height: 'clamp(400px, 60vh, 800px)',
            minHeight: '400px',
            borderRadius: '8px',
            border: '1px solid rgba(0, 217, 255, 0.3)',
            overflow: 'hidden',
            backgroundColor: '#0a0a0a',
            position: 'relative',
            boxShadow: '0 0 30px rgba(0, 217, 255, 0.1)',
          }}
        >
          {!mapLoaded && (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 0.5)',
                fontFamily: 'var(--font-space-mono), monospace',
                gap: '12px',
                padding: '20px',
              }}
            >
              {mapError ? (
                <>
                  <div style={{ color: '#ef4444', fontSize: '16px', marginBottom: '8px' }}>
                    加载失败
                  </div>
                  <div style={{ fontSize: '12px', textAlign: 'center', maxWidth: '400px' }}>
                    {mapError}
                  </div>
                  <button
                    onClick={() => {
                      setMapError(null)
                      setMapLoaded(false)
                      // 重新加载页面以重新初始化地图
                      window.location.reload()
                    }}
                    style={{
                      marginTop: '12px',
                      padding: '8px 16px',
                      border: '1px solid rgba(0, 217, 255, 0.3)',
                      backgroundColor: 'rgba(0, 217, 255, 0.05)',
                      color: '#00d9ff',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-space-mono), monospace',
                      fontSize: '12px',
                    }}
                  >
                    重试
                  </button>
                </>
              ) : (
                <>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      border: '3px solid rgba(0, 217, 255, 0.3)',
                      borderTopColor: '#00d9ff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }}
                  />
                  <div>地图加载中...</div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 地点列表 */}
      {showList && (
        <div
          style={{
            display: 'grid',
            gap: '24px',
          }}
        >
          {allLocations.map((location) => {
            const isExpanded = selectedLocation === location.id

            return (
              <div
                key={location.id}
                style={{
                  padding: '24px',
                  border: '1px solid rgba(0, 217, 255, 0.3)',
                  backgroundColor: 'rgba(0, 217, 255, 0.05)',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setSelectedLocation(isExpanded ? null : location.id)
                  if (mapLoaded) {
                    focusOnLocation(location.id)
                  }
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
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '16px',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#00d9ff',
                        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                        marginBottom: '8px',
                      }}
                    >
                      {location.name}
                    </h3>
                    <p
                      style={{
                        fontSize: '14px',
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                        marginBottom: '4px',
                      }}
                    >
                      {location.location}
                    </p>
                    <span
                      style={{
                        fontSize: '12px',
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontFamily: 'var(--font-space-mono), monospace',
                      }}
                    >
                      {formatDate(location.date)}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontFamily: 'var(--font-space-mono), monospace',
                      padding: '4px 12px',
                      border: '1px solid rgba(0, 217, 255, 0.3)',
                      borderRadius: '4px',
                    }}
                  >
                    {location.coordinates.lat.toFixed(2)}°,{' '}
                    {location.coordinates.lng.toFixed(2)}°
                  </div>
                </div>

                {/* 描述 */}
                {isExpanded && (
                  <>
                    <p
                      style={{
                        fontSize: '14px',
                        lineHeight: '1.8',
                        color: 'rgba(255, 255, 255, 0.85)',
                        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                        marginBottom: '16px',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {location.description}
                    </p>

                    {/* 标签 */}
                    {location.tags && location.tags.length > 0 && (
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '6px',
                          marginTop: '12px',
                        }}
                      >
                        {location.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '11px',
                              color: 'rgba(255, 255, 255, 0.6)',
                              fontFamily: 'var(--font-space-mono), monospace',
                              padding: '2px 8px',
                              backgroundColor: 'rgba(0, 217, 255, 0.1)',
                              borderRadius: '4px',
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* 展开/收起提示 */}
                <div
                  style={{
                    marginTop: '12px',
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontFamily: 'var(--font-space-mono), monospace',
                    textAlign: 'right',
                  }}
                >
                  {isExpanded ? '点击收起' : '点击查看详情'}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
