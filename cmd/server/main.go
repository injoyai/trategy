package main

import (
	"github.com/injoyai/logs"
	"github.com/injoyai/trategy/internal/api"
	"github.com/injoyai/trategy/internal/common"
)

func main() {
	logs.PanicErr(common.Init())
	common.Data.Start()
	logs.Err(api.Run())
}
