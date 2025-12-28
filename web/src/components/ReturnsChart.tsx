import React from 'react'
import ReactECharts from 'echarts-for-react'

export default function ReturnsChart({ equity }: { equity: number[] }) {
  if (!equity || equity.length === 0) return null
  const base = equity[0] || 1
  const x = equity.map((_, i) => i)
  const ret = equity.map(v => Number((((v / base) - 1) * 100).toFixed(2)))
  const option = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: x },
    yAxis: { type: 'value', axisLabel: { formatter: (v: number) => `${v.toFixed(0)}%` } },
    series: [
      { type: 'line', data: ret, smooth: true, name: '收益', showSymbol: false, lineStyle: { width: 2, color: '#722ed1' }, areaStyle: { color: 'rgba(114,46,209,0.15)' } },
    ]
  }
  return <ReactECharts option={option} style={{ height: 320 }} />
}

