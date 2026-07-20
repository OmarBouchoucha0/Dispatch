package handler

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	"github.com/OmarBouchoucha0/Dispatch/backend/internal/auth"
	"github.com/OmarBouchoucha0/Dispatch/backend/internal/db"
	"github.com/jackc/pgx/v5/pgconn"
)

type ListDevicesRequest struct {
	Name string `json:"device_name"`
}

func ListDevices(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	devices, err := db.GetDevices(ctx)
	if err != nil {
		slog.Error("coudnt get devices", "error", err)
		http.Error(w, http.StatusText(http.StatusUnprocessableEntity), http.StatusUnprocessableEntity)
		return
	}
	w.Header().Set("Content-Type", "application/json")

	var req []RenameDeviceRequest

	for _, device := range devices {
		req = append(req, RenameDeviceRequest{Name: device.Name})
	}

	err = json.NewEncoder(w).Encode(req)
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
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			slog.Error("device name already exists", "name", req.Name)
			http.Error(w, "device name already exists", http.StatusConflict)
			return
		}
		slog.Error("coudnt add device", "error", err)
		http.Error(w, http.StatusText(http.StatusUnprocessableEntity), http.StatusUnprocessableEntity)
		return
	}
	slog.Info("device added")
}

type RenameDeviceRequest struct {
	DeviceID string `json:"device_id"`
	Name     string `json:"name"`
	NewName  string `json:"new_name"`
}

func RenameDevice(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	claims, ok := ctx.Value(auth.UserKey).(*auth.Claims)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req RenameDeviceRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		slog.Error("json decoding", "error", err)
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}
	err = db.RenameDevice(ctx, req.Name, req.NewName)
	if err != nil {
		slog.Error("coudnt add device", "error", err)
		http.Error(w, http.StatusText(http.StatusUnprocessableEntity), http.StatusUnprocessableEntity)
		return
	}

	log := db.Log{
		UserID:   claims.UserID,
		DeviceID: req.DeviceID,
		Action:   "Renamed",
	}
	err = db.AddLog(ctx, log)
	if err != nil {
		slog.Error("coudnt add log", "error", err)
		http.Error(w, http.StatusText(http.StatusUnprocessableEntity), http.StatusUnprocessableEntity)
		return
	}
	slog.Info("device renamed")
}

type DeleteDeviceRequest struct {
	DeviceID string `json:"device_id"`
	Name     string `json:"name"`
}

func DeleteDevice(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	claims, ok := ctx.Value(auth.UserKey).(*auth.Claims)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req DeleteDeviceRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		slog.Error("json decoding", "error", err)
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}
	err = db.DeleteDevice(ctx, req.Name)
	if err != nil {
		slog.Error("coudnt delete device", "error", err)
		http.Error(w, http.StatusText(http.StatusUnprocessableEntity), http.StatusUnprocessableEntity)
		return
	}

	log := db.Log{
		UserID:   claims.UserID,
		DeviceID: req.DeviceID,
		Action:   "Deleted",
	}
	err = db.AddLog(ctx, log)
	if err != nil {
		slog.Error("coudnt add log", "error", err)
		http.Error(w, http.StatusText(http.StatusUnprocessableEntity), http.StatusUnprocessableEntity)
		return
	}
	slog.Info("device deleted")
}
