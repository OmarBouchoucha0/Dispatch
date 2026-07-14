package handler

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/OmarBouchoucha0/Dispatch/backend/internal/db"
)

func ListDevices(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	configs, err := db.GetDevices(ctx)
	if err != nil {
		slog.Error("coudnt get devices", "error", err)
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
}

type CreateDeviceRequest struct {
	Name string `json:"device_name"`
}

func AddDevice(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var req CreateDeviceRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		slog.Error("json decoding", "error", err)
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}
	device := db.Device{
		Name: req.Name,
	}
	err = db.AddDevice(ctx, device)
	if err != nil {
		slog.Error("coudnt add device", "error", err)
		http.Error(w, http.StatusText(http.StatusUnprocessableEntity), http.StatusUnprocessableEntity)
		return
	}
	slog.Info("device added")
}
