package handler

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/OmarBouchoucha0/Dispatch/backend/internal/db"
)

func ListConfigs(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	configs, err := db.GetConfigs(ctx)
	if err != nil {
		slog.Error("coudnt get configs", "error", err)
		http.Error(w, http.StatusText(http.StatusUnprocessableEntity), http.StatusUnprocessableEntity)
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

	w.WriteHeader(http.StatusOK)
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
		DeviceID: req.DeviceID,
		UserID:   req.UserID,
		Content:  req.Content,
	}
	err = db.AddConfig(ctx, config)
	if err != nil {
		slog.Error("coudnt add config", "error", err)
		http.Error(w, http.StatusText(http.StatusUnprocessableEntity), http.StatusUnprocessableEntity)
		return
	}
	log := db.Log{
		UserID:   req.UserID,
		DeviceID: req.DeviceID,
		Action:   "Created",
	}
	err = db.AddLog(ctx, log)
	if err != nil {
		slog.Error("coudnt add log", "error", err)
		http.Error(w, http.StatusText(http.StatusUnprocessableEntity), http.StatusUnprocessableEntity)
		return
	}
	slog.Info("config added")
}
