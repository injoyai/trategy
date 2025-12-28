package strategy

import (
	"github.com/injoyai/tdx/protocol"
)

type SMA struct {
	Fast int
	Slow int
}

func (s SMA) Name() string {
	return "sma_cross"
}

func sma(xs []float64, n int) []float64 {
	if n <= 0 {
		return nil
	}
	out := make([]float64, len(xs))
	var sum float64
	for i := 0; i < len(xs); i++ {
		sum += xs[i]
		if i >= n {
			sum -= xs[i-n]
		}
		if i >= n-1 {
			out[i] = sum / float64(n)
		}
	}
	return out
}

func (s SMA) Signals(ks protocol.Klines) []int {
	prices := make([]float64, len(ks))
	for i := range ks {
		prices[i] = ks[i].Close.Float64()
	}
	f := sma(prices, s.Fast)
	l := sma(prices, s.Slow)
	out := make([]int, len(ks))
	var prev int
	for i := range ks {
		var sig int
		if f[i] == 0 || l[i] == 0 {
			sig = 0
		} else if f[i] > l[i] {
			sig = 1
		} else if f[i] < l[i] {
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
	Register(SMA{Fast: 5, Slow: 20})
}
