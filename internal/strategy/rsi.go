package strategy

import (
	"github.com/injoyai/tdx/protocol"
)

type RSI struct {
	Period int
}

func (r RSI) Name() string {
	return "rsi"
}

func (r RSI) Signals(ks protocol.Klines) []int {
	n := r.Period
	if n <= 1 {
		n = 14
	}
	gains := make([]float64, len(ks))
	losses := make([]float64, len(ks))
	for i := 1; i < len(ks); i++ {
		d := ks[i].Close - ks[i-1].Close
		if d > 0 {
			gains[i] = d.Float64()
		} else {
			losses[i] = -d.Float64()
		}
	}
	var avgGain, avgLoss float64
	for i := 1; i <= n && i < len(ks); i++ {
		avgGain += gains[i]
		avgLoss += losses[i]
	}
	avgGain /= float64(n)
	avgLoss /= float64(n)
	rsi := make([]float64, len(ks))
	for i := n + 1; i < len(ks); i++ {
		avgGain = (avgGain*float64(n-1) + gains[i]) / float64(n)
		avgLoss = (avgLoss*float64(n-1) + losses[i]) / float64(n)
		if avgLoss == 0 {
			rsi[i] = 100
		} else {
			rs := avgGain / avgLoss
			rsi[i] = 100 - 100/(1+rs)
		}
	}
	out := make([]int, len(ks))
	var prev int
	for i := range ks {
		var sig int
		if rsi[i] == 0 {
			sig = 0
		} else if rsi[i] > 50 {
			sig = 1
		} else if rsi[i] < 50 {
			sig = -1
		}
		if sig != prev {
			out[i] = sig
			prev = sig
		}
	}
	return out
}

func init() {
	Register(RSI{Period: 14})
}
