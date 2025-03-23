package main

import (
	"github.com/emvi/emvi.com/pkg/config"
	"github.com/emvi/emvi.com/pkg/contact"
	shifu "github.com/emvi/shifu/pkg"
	"github.com/go-chi/chi/v5"
	"log/slog"
)

func main() {
	config.Load()
	router := chi.NewRouter()
	router.Get("/contact/challenge", contact.Captcha)
	s, err := shifu.NewServer("", shifu.ServerOptions{
		Router: router,
	})

	if err != nil {
		panic(err)
	}

	if err := s.Start(nil); err != nil {
		slog.Error("Error starting server", "error", err)
	}
}
