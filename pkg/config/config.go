package config

import (
	"encoding/json"
	"log/slog"
	"os"
	"strings"
)

const (
	configFile = "config.json"
)

var (
	config Config
)

type Config struct {
	Captcha Captcha `json:"captcha"`
	Email   Email   `json:"email"`
}

type Captcha struct {
	HMACKey   string `toml:"hmac_key"`
	MaxNumber int64  `toml:"max_number"`
}

type Email struct {
	Host     string `json:"host"`
	Port     int    `json:"port"`
	Username string `json:"username"`
	Password string `json:"password"`
	From     string `json:"from"`
}

func Load() {
	path := ""

	if len(os.Args) > 1 {
		path = strings.TrimSpace(os.Args[1])
	}

	if path == "" {
		path = configFile
	}

	slog.Info("Loading configuration file", "path", path)
	data, err := os.ReadFile(path)

	if err != nil {
		slog.Error("Error loading configuration file", "err", err)
		panic(err)
	}

	if err := json.Unmarshal(data, &config); err != nil {
		slog.Error("Error parsing configuration file", "err", err)
		panic(err)
	}
}

func Get() *Config {
	return &config
}
