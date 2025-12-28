import React, { useEffect, useState } from 'react'
import { Card, Table, Space, Input, message, Row, Col } from 'antd'
import Editor from '@monaco-editor/react'
import { getStrategies } from '../lib/api'

export default function StrategyPage() {
  const [strategies, setStrategies] = useState<string[]>([])
  const [scriptName, setScriptName] = useState<string>('my_strategy')
  const [scriptCode, setScriptCode] = useState<string>(`package strategy

import (
	"github.com/injoyai/tdx/protocol"
)

type OnlineStrategy struct{}

func (OnlineStrategy) Name() string { return "online_strategy" }

func (OnlineStrategy) Signals(ks protocol.Klines) []int {
	if len(ks) == 0 { return nil }
	out := make([]int, len(ks))
	for i := range ks {
		out[i] = 0
	}
	return out
}
`)

  useEffect(() => {
    (async () => {
      try {
        const list = await getStrategies()
        setStrategies(list)
      } catch {
        setStrategies(['sma_cross','rsi'])
      }
    })()
  }, [])

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Card title="策略">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
          <Card size="small" title="策略列表">
            <Table
              size="small"
              rowKey="name"
              dataSource={strategies.map(s => ({ name: s }))}
              pagination={{ pageSize: 10 }}
              onRow={r => ({ onClick: () => setScriptName((r as any).name) })}
              columns={[
                { title: '名称', dataIndex: 'name' },
              ]}
            />
            <Space style={{ marginTop: 12 }}>
              <Input
                value={scriptName}
                onChange={e => setScriptName(e.target.value)}
                placeholder="策略名称"
                style={{ width: 160 }}
              />
              <a onClick={() => {
                try {
                  localStorage.setItem(`online_strategy_${scriptName}`, scriptCode)
                  message.success('已保存到本地')
                } catch { message.error('保存失败') }
              }}>保存到本地</a>
              <a onClick={() => {
                const code = localStorage.getItem(`online_strategy_${scriptName}`)
                if (code) {
                  setScriptCode(code)
                  message.success('已从本地加载')
                } else {
                  message.warning('本地未找到该策略')
                }
              }}>从本地加载</a>
            </Space>
          </Card>
          </Col>
          <Col xs={24} md={18}>
          <Card size="small" title={scriptName ? `编辑：${scriptName}` : '编辑器'}>
            <div style={{ height: '70vh' }}>
              <Editor
                height="100%"
                defaultLanguage="go"
                theme="vs-dark"
                value={scriptCode}
                onChange={(v) => setScriptCode(v || '')}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>
          </Card>
          </Col>
        </Row>
      </Card>
    </Space>
  )
}
