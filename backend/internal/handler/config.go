package handler

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/OmarBouchoucha0/Dispatch/backend/internal/db"
	"github.com/go-chi/chi/v5"
)

type contextKey string

const configKey contextKey = "config"

func ConfigCtx(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		deviceID := chi.URLParam(r, "deviceID")
		config, err := db.GetConfigByDeviceID(ctx, deviceID)
		if err != nil {
			http.Error(w, http.StatusText(404), 404)
			return
		}
		ctx = context.WithValue(ctx, configKey, config)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func ListConfigs(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	configs, err := db.GetConfigs(ctx)
	if err != nil {
		slog.Error("coudnt get configs", "error", err)
		http.Error(w, http.StatusText(422), 422)
		return
	}
	w.Header().Set("Content-Type", "application/json")

	err = json.NewEncoder(w).Encode(configs)
	if err != nil {
		slog.Error("json encoding", "error", err)
		http.Error(
			w,
			http.StatusText(http.StatusInternalServerError),
			http.StatusInternalServerError,
		)
		return
	}
	slog.Info("config Listed", "configs", configs)
}

type CreateConfigRequest struct {
	DeviceID string          `json:"device_id"`
	UserID   string          `json:"user_id"`
	Content  json.RawMessage `json:"content"`
}

func AddConfig(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var req CreateConfigRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		slog.Error("json decoding", "error", err)
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}
	config := db.Config{
		"1",
		req.DeviceID,
		req.UserID,
		req.Content,
	}
	err = db.AddConfig(ctx, config)
	if err != nil {
		slog.Error("coudnt add config", "error", err)
		http.Error(w, http.StatusText(422), 422)
		return
	}
	slog.Info("config added")
}
