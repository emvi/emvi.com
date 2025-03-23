package contact

import (
	"encoding/json"
	"errors"
	"github.com/altcha-org/altcha-lib-go"
	"github.com/emvi/emvi.com/pkg/config"
	"log/slog"
	"net/http"
	"syscall"
)

func Captcha(w http.ResponseWriter, _ *http.Request) {
	cfg := config.Get().Captcha
	challenge, err := altcha.CreateChallenge(altcha.ChallengeOptions{
		HMACKey:   cfg.HMACKey,
		MaxNumber: cfg.MaxNumber,
	})

	if err != nil {
		slog.Error("Error creating challenge", "err", err)
		return
	}

	resp, err := json.Marshal(challenge)

	if err != nil {
		slog.Error("Error marshalling response", "err", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if _, err := w.Write(resp); err != nil && !errors.Is(err, syscall.EPIPE) {
		slog.Error("Error writing response", "err", err)
	}
}
