import React from 'react'
import ReactECharts from 'echarts-for-react'

export default function EquityChart({ equity, cash, trades }: { equity: number[], cash?: number[], trades?: { index: number, side: string, price: number }[] }) {
  if (!equity || equity.length === 0) return null
  const x = equity.map((_, i) => i)
  const buyPts = (trades || []).filter(t => t.side === 'buy').map(t => ({
    value: [t.index, equity[t.index]],
    symbolSize: 10,
    itemStyle: { borderColor: '#237804', borderWidth: 2, color: '#52c41a' }
  }))
  const sellPts = (trades || []).filter(t => t.side === 'sell').map(t => ({
    value: [t.index, equity[t.index]],
    symbolSize: 10,
    itemStyle: { borderColor: '#a8071a', borderWidth: 2, color: '#f5222d' }
  }))
  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    legend: {},
    xAxis: { type: 'category', data: x },
    yAxis: { type: 'value', scale: true, axisLabel: { formatter: (v: number) => v.toFixed(0) } },
    grid: { left: 50, right: 30, top: 40, bottom: 50 },
    dataZoom: [{ type: 'inside' }, { type: 'slider' }],
    series: [
      { type: 'line', data: equity, smooth: true, name: '权益', showSymbol: false, lineStyle: { width: 2, color: '#1890ff' }, areaStyle: { color: 'rgba(24,144,255,0.15)' } },
      cash && cash.length ? { type: 'line', data: cash, smooth: true, name: '现金', showSymbol: false, lineStyle: { type: 'dashed', width: 1, color: '#8c8c8c' } } as any : undefined,
      { type: 'scatter', data: buyPts, name: '买入', symbol: 'triangle' },
      { type: 'scatter', data: sellPts, name: '卖出', symbol: 'triangle', symbolRotate: 180 },
    ].filter(Boolean)
  }
  return <ReactECharts option={option} style={{ height: 360 }} />
}
