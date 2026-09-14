import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

interface ChartProps {
  option: echarts.EChartsOption
  style?: React.CSSProperties
  className?: string
}

export default function Chart({ option, style, className }: ChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current)
      chartInstance.current.setOption(option)
    }

    return () => {
      chartInstance.current?.dispose()
    }
  }, [option])

  useEffect(() => {
    const handleResize = () => {
      chartInstance.current?.resize()
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div
      ref={chartRef}
      style={{ width: '100%', height: '400px', ...style }}
      className={className}
    />
  )
}
