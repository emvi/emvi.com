package main

import (
	"github.com/emvi/emvi.com/pkg/config"
	"github.com/emvi/emvi.com/pkg/contact"
	shifu "github.com/emvi/shifu/pkg"
	"github.com/emvi/shifu/pkg/cms"
	"github.com/go-chi/chi/v5"
	"log/slog"
	"net/http"
	"strings"
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

	s.Content.SetHandler("contact_form", func(cms *cms.CMS, page cms.Content, args map[string]string, w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			// TODO
			slog.Info("SEND EMAIL")
		}

		cms.RenderPage(w, r, strings.ToLower(r.URL.Path), args, &page)
	})

	if err := s.Start(nil); err != nil {
		slog.Error("Error starting server", "error", err)
	}
}
