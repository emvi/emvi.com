package main

import (
	"github.com/emvi/emvi.com/pkg/config"
	"github.com/emvi/emvi.com/pkg/handler"
	shifu "github.com/emvi/shifu/pkg"
	"github.com/go-chi/chi/v5"
	"log/slog"
)

func main() {
	config.Load()
	router := chi.NewRouter()
	router.Get("/contact/challenge", handler.Captcha)
	s, err := shifu.NewServer("", shifu.ServerOptions{
		Router: router,
	})

	if err != nil {
		panic(err)
	}

	s.Content.SetHandler("contact_form", handler.ContactForm)

	if err := s.Start(nil); err != nil {
		slog.Error("Error starting server", "error", err)
	}
}
