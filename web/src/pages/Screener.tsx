import React, { useEffect, useState } from 'react'
import { Card, Form, Select, InputNumber, Button, Table, Tag, Space, message, Switch, Row, Col } from 'antd'
import { getStrategies, screener, getKlines, backtest } from '../lib/api'
import PriceChart from '../components/PriceChart'
import { mockScreener, mockCandles, mockBacktest } from '../lib/mock'

export default function ScreenerPage() {
  const [strategies, setStrategies] = useState<string[]>([])
  const [data, setData] = useState<any[]>([])
  const [charts, setCharts] = useState<Record<string, { candles: any[], trades: { index: number, side: string }[] }>>({})
  const [loading, setLoading] = useState(false)
  const [useMock, setUseMock] = useState(true)
  const [form] = Form.useForm()
  const [visibleCount, setVisibleCount] = useState(60)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const strats = await getStrategies()
        setStrategies(strats)
        form.setFieldsValue({ strategy: strats[0], lookback: 10 })
      } catch {
        const strats = ['sma_cross','rsi']
        setStrategies(strats)
        form.setFieldsValue({ strategy: strats[0], lookback: 10 })
      }
    })()
  }, [])

  async function onRun() {
    const v = await form.validateFields()
    setLoading(true)
    try {
      if (useMock) {
        const list = mockScreener(60)
        setData(list)
        setVisibleCount(60)
        await loadChartsFor(list.slice(0, 60), true, v.strategy)
      } else {
        const res = await screener({ strategy: v.strategy, lookback: v.lookback })
        setData(res)
        setVisibleCount(60)
        await loadChartsFor(res.slice(0, 60), false, v.strategy)
      }
    } catch (e: any) {
      message.error(e?.message || '选股失败')
    } finally {
      setLoading(false)
    }
  }

  async function loadChartsFor(items: any[], mockMode: boolean, strategy: string) {
    const nextCharts: Record<string, { candles: any[], trades: { index: number, side: string }[] }> = { ...charts }
    const chunkSize = 6
    for (let i = 0; i < items.length; i += chunkSize) {
      const batch = items.slice(i, i + chunkSize)
      const promises = batch.map(async (item) => {
        if (nextCharts[item.symbol]) return
        if (mockMode) {
          const cs = mockCandles(item.symbol)
          const bt = mockBacktest()
          nextCharts[item.symbol] = { candles: cs, trades: bt.trades as any }
        } else {
          try {
            const cs = await getKlines({ code: item.symbol })
            const bt = await backtest({
              strategy,
              symbol: item.symbol,
              cash: 100000,
              size: 10,
            })
            nextCharts[item.symbol] = {
              candles: cs,
              trades: bt.trades.map((t: any) => ({ index: t.index, side: t.side }))
            }
          } catch {
            const cs = mockCandles(item.symbol)
            const bt = mockBacktest()
            nextCharts[item.symbol] = { candles: cs, trades: bt.trades as any }
          }
        }
      })
      await Promise.all(promises)
      setCharts({ ...nextCharts })
    }
  }

  useEffect(() => {
    const onScroll = async () => {
      const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 300
      if (!nearBottom || loadingMore || data.length === 0) return
      const v = form.getFieldsValue()
      setLoadingMore(true)
      const nextCount = Math.min(visibleCount + 60, data.length)
      const slice = data.slice(visibleCount, nextCount)
      await loadChartsFor(slice, useMock, v.strategy)
      setVisibleCount(nextCount)
      setLoadingMore(false)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [visibleCount, data, useMock])

  function onExportCSV() {
    const header = ['symbol','price','score','signal']
    const rows = data.map(r => [r.symbol, r.price, r.score, r.signal])
    const csv = [header.join(','), ...rows.map(x => x.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'screener.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Card title="选股条件">
        <Form form={form} layout="inline">
          <Form.Item name="strategy" label="策略" rules={[{ required: true }]}>
            <Select style={{ width: 200 }} options={strategies.map(s => ({ value: s, label: s }))} />
          </Form.Item>
          <Form.Item name="lookback" label="回看天数">
            <InputNumber min={5} max={60} />
          </Form.Item>
          <Form.Item name="min_score" label="最小评分">
            <InputNumber step={0.001} />
          </Form.Item>
          <Form.Item name="signal" label="信号">
            <Select style={{ width: 120 }} options={[
              { value: 0, label: '全部' },
              { value: 1, label: '买入' },
              { value: -1, label: '卖出' },
            ]} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={onRun} loading={loading}>运行选股</Button>
          </Form.Item>
          <Form.Item>
            <Button onClick={onExportCSV}>导出CSV</Button>
          </Form.Item>
          <Form.Item label="使用示例数据">
            <Switch checked={useMock} onChange={setUseMock} />
          </Form.Item>
        </Form>
      </Card>
      <Card title="结果">
        <Table
          rowKey="symbol"
          dataSource={data}
          columns={[
            { title: '股票', dataIndex: 'symbol' },
            { title: '价格', dataIndex: 'price' },
            { title: '评分', dataIndex: 'score', render: (v: number) => v.toFixed(4) },
            { title: '信号', dataIndex: 'signal', render: (s: number) => s === 1 ? <Tag color="green">买入</Tag> : s === -1 ? <Tag color="red">卖出</Tag> : <Tag>观望</Tag> },
          ]}
        />
      </Card>
      <Card title="K线与买卖点">
        <Row gutter={[12,12]}>
          {data.slice(0, visibleCount).map((item) => {
            const c = charts[item.symbol]
            return (
              <Col key={item.symbol} span={8}>
                <Card size="small" title={item.symbol}>
                  {c ? <PriceChart candles={c.candles} trades={c.trades} /> : <div>加载中...</div>}
                </Card>
              </Col>
            )
          })}
        </Row>
      </Card>
    </Space>
  )
}
