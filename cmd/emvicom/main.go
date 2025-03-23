package main

import (
	"fmt"
	"github.com/emvi/emvi.com/pkg/captcha"
	"github.com/emvi/emvi.com/pkg/config"
	shifu "github.com/emvi/shifu/pkg"
	"github.com/emvi/shifu/pkg/cms"
	"github.com/go-chi/chi/v5"
	"log/slog"
	"net/http"
	"net/smtp"
	"strings"
)

func main() {
	config.Load()
	router := chi.NewRouter()
	router.Get("/contact/challenge", captcha.Captcha)
	s, err := shifu.NewServer("", shifu.ServerOptions{
		Router: router,
	})

	if err != nil {
		panic(err)
	}

	s.Content.SetHandler("contact_form", func(cms *cms.CMS, page cms.Content, args map[string]string, w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			name := r.FormValue("name")
			email := r.FormValue("email")
			phone := r.FormValue("phone")
			requestType := r.FormValue("type")
			msg := r.FormValue("message")

			// TODO validate fields

			message := fmt.Sprintf("Name: %s\r\nEmail: %s\r\nPhone: %s\r\nRequest: %s\r\n%s", name, email, phone, requestType, msg)
			cfg := config.Get().Email
			auth := smtp.PlainAuth("",
				cfg.Username,
				cfg.Password,
				cfg.Host)

			if err := smtp.SendMail(fmt.Sprintf("%s:%d", cfg.Host, cfg.Port),
				auth,
				cfg.From,
				[]string{"marvin.blum@emvi.com"},
				[]byte(constructEmail(cfg.From, cfg.From, "Request received", message))); err != nil {
				slog.Error("Unable to send email", "error", err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}

			slog.Info("Email sent")
		}

		cms.RenderPage(w, r, strings.ToLower(r.URL.Path), args, &page)
	})

	if err := s.Start(nil); err != nil {
		slog.Error("Error starting server", "error", err)
	}
}

func constructEmail(from, to, subject, body string) string {
	headers := make(map[string]string)
	headers["From"] = from
	headers["To"] = to
	headers["Subject"] = subject
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = "text/plain; charset=\"utf-8\""
	message := ""

	for key, value := range headers {
		message += fmt.Sprintf("%s: %s\r\n", key, value)
	}

	return message + "\r\n" + body
}
