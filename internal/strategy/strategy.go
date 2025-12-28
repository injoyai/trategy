package strategy

import (
	"github.com/injoyai/tdx/protocol"
)

type Strategy interface {
	Name() string
	Signals(ks protocol.Klines) []int
}

var strategies = map[string]Strategy{}

func Register(s Strategy) {
	strategies[s.Name()] = s
}

func Get(name string) Strategy {
	return strategies[name]
}

func Registry() []string {
	out := make([]string, 0, len(strategies))
	for k := range strategies {
		out = append(out, k)
	}
	return out
}
