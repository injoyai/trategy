package strategy

import (
	"strings"

	"github.com/injoyai/tdx/extend"
)

var _ Interface = (*ExcludeSt)(nil)

type ExcludeSt struct{}

func (ExcludeSt) Name() string {
	return "排除ST"
}

func (ExcludeSt) Type() string { return DayKline }

func (ExcludeSt) Signal(info extend.Info, day, min extend.Klines) bool {
	return !strings.Contains(info.Name, "ST")
}

func init() {
	Register(ExcludeSt{})
}
