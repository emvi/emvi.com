package handler

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"net/smtp"
	"strings"
	"unicode/utf8"

	"github.com/altcha-org/altcha-lib-go"
	"github.com/emvi/emvi.com/pkg/config"
	"github.com/emvi/shifu/pkg/cms"
)

func ContactForm(cms *cms.CMS, page cms.Content, args map[string]string, w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodPost {
		if page.Data == nil {
			page.Data = map[string]any{}
		}

		if err := validateCaptcha(r); err != nil {
			page.Data["error"] = "captcha"
			w.WriteHeader(http.StatusBadRequest)
		} else {
			name := maxLength(strings.TrimSpace(r.FormValue("name")), 200)
			email := maxLength(strings.TrimSpace(r.FormValue("email")), 200)
			phone := maxLength(strings.TrimSpace(r.FormValue("phone")), 40)
			requestType := maxLength(strings.TrimSpace(r.FormValue("type")), 200)
			msg := maxLength(strings.TrimSpace(r.FormValue("message")), 2000)

			if name == "" || email == "" {
				page.Data["error"] = "form"
				w.WriteHeader(http.StatusBadRequest)
			} else {
				message := fmt.Sprintf("Name: %s\r\nEmail: %s\r\nPhone: %s\r\nRequest: %s\r\n%s", name, email, phone, requestType, msg)
				cfg := config.Get().Email
				auth := smtp.PlainAuth("",
					cfg.Username,
					cfg.Password,
					cfg.Host)

				if err := smtp.SendMail(fmt.Sprintf("%s:%d", cfg.Host, cfg.Port),
					auth,
					cfg.From,
					[]string{cfg.To},
					[]byte(constructEmail(cfg.From, cfg.From, "Request received", message))); err != nil {
					slog.Error("Unable to send email", "error", err)
					w.WriteHeader(http.StatusInternalServerError)
					return
				}

				page.Data["success"] = "true"
				slog.Info("Email sent")
			}
		}
	}

	cms.RenderPage(w, r, strings.ToLower(r.URL.Path), args, &page)
}

func validateCaptcha(r *http.Request) error {
	formData := r.FormValue("altcha")
	decodedPayload, err := base64.StdEncoding.DecodeString(formData)

	if err != nil {
		return errors.New("error decoding captcha payload")
	}

	var payload map[string]any

	if err := json.Unmarshal(decodedPayload, &payload); err != nil {
		return errors.New("error unmarshalling captcha json payload")
	}

	verified, err := altcha.VerifySolution(payload, config.Get().Captcha.HMACKey, true)

	if err != nil || !verified {
		return err
	}

	return nil
}

func maxLength(s string, n int) string {
	if utf8.RuneCountInString(s) > n {
		return s[:n]
	}

	return s
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
