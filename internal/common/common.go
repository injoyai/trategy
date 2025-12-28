package common

import (
	"github.com/injoyai/tdx"
	"github.com/injoyai/trategy/internal/data"
)

var (
	Data *data.Data
)

func Init() error {
	m, err := tdx.NewManage(tdx.WithClients(3))
	if err != nil {
		return err
	}
	Data, err = data.NewManage(m)
	return err
}
