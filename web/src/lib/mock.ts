import dayjs from 'dayjs'

export function mockCandles(symbol: string, n = 80) {
  const start = dayjs('2024-03-01')
  let price = symbol === 'TRENDDOWN' ? 50 : 10
  const arr: { Time: string, Open: number, High: number, Low: number, Close: number, Volume: number, Symbol: string }[] = []
  for (let i = 0; i < n; i++) {
    const d = start.add(i, 'day')
    const bias =
      symbol === 'TRENDUP' ? 0.3 :
      symbol === 'TRENDDOWN' ? -0.3 :
      0
    const rnd = (Math.random() - 0.5) * 1.0 + bias
    const open = price
    const close = Math.max(0.1, open + rnd)
    const high = Math.max(open, close) + Math.random() * 0.5
    const low = Math.min(open, close) - Math.random() * 0.5
    price = close
    arr.push({
      Time: d.toISOString(),
      Open: Number(open.toFixed(4)),
      High: Number(high.toFixed(4)),
      Low: Number(low.toFixed(4)),
      Close: Number(close.toFixed(4)),
      Volume: Math.floor(50000 + Math.random() * 50000),
      Symbol: symbol
    })
  }
  return arr
}

export function mockScreener(n = 60) {
  const syms = Array.from({ length: n }, (_, i) => `SYM${String(i + 1).padStart(3, '0')}`)
  return syms.map(s => {
    const bias =
      s.includes('001') || s.includes('005') ? 0.08 :
      s.includes('013') ? -0.06 : 0
    const score = Number(((Math.random() - 0.2) * 0.2 + bias).toFixed(4))
    const price = Number((10 + Math.random() * 90).toFixed(2))
    const r = Math.random()
    const signal = r > 0.66 ? 1 : r < 0.33 ? -1 : 0
    return { symbol: s, score, price, signal }
  }).sort((a, b) => b.score - a.score)
}

export function mockBacktest() {
  const n = 120
  const equity: number[] = []
  const cash: number[] = []
  let v = 100000
  let c = 100000
  for (let i = 0; i < n; i++) {
    const rnd = (Math.random() - 0.4) * 500
    const cashFlow = (Math.random() - 0.5) * 200
    c = Math.max(20000, c + cashFlow)
    v = Math.max(50000, v + rnd + (i > 30 ? 50 : 0))
    equity.push(Number(v.toFixed(2)))
    cash.push(Number(c.toFixed(2)))
  }
  const trades = [
    { index: 10, side: 'buy', price: 100 },
    { index: 40, side: 'sell', price: 110 },
    { index: 60, side: 'buy', price: 105 },
    { index: 95, side: 'sell', price: 120 },
  ]
  const ret = (equity[equity.length - 1] - 100000) / 100000
  const maxDrawdown = 0.12 + Math.random() * 0.08
  const sharpe = Number((0.8 + Math.random() * 0.5).toFixed(2))
  return {
    equity,
    cash,
    trades,
    return: Number(ret.toFixed(4)),
    max_drawdown: Number(maxDrawdown.toFixed(4)),
    sharpe
  }
}
