package handler

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/OmarBouchoucha0/Dispatch/backend/internal/auth"
	"github.com/OmarBouchoucha0/Dispatch/backend/internal/db"
	"github.com/jackc/pgx/v5/pgconn"
)

type ListDevicesResponse struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
}

func ListDevices(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	loc := getLocation(r)
	devices, err := db.GetDevices(ctx)
	if err != nil {
		slog.Error("coudnt get devices", "error", err)
		http.Error(w, http.StatusText(http.StatusUnprocessableEntity), http.StatusUnprocessableEntity)
		return
	}
	w.Header().Set("Content-Type", "application/json")

	var res []ListDevicesResponse

	for _, device := range devices {
		res = append(res, ListDevicesResponse{
			ID:        device.ID,
			Name:      device.Name,
			CreatedAt: device.CreatedAt.In(loc),
		})
	}

	err = json.NewEncoder(w).Encode(res)
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
	created, err := db.AddDevice(ctx, device)
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
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(ListDevicesResponse{
		ID:        created.ID,
		Name:      created.Name,
		CreatedAt: created.CreatedAt,
	})
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

func UpdateDevice(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := chi.URLParam(r, "id")

	var req struct {
		Name *string `json:"name"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		slog.Error("json decoding", "error", err)
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}

	if err := db.UpdateDevice(ctx, id, req.Name); err != nil {
		slog.Error("update device", "error", err)
		http.Error(w, http.StatusText(http.StatusUnprocessableEntity), http.StatusUnprocessableEntity)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func DeleteDeviceByID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := chi.URLParam(r, "id")

	if err := db.DeleteDeviceByID(ctx, id); err != nil {
		slog.Error("delete device", "error", err)
		http.Error(w, http.StatusText(http.StatusUnprocessableEntity), http.StatusUnprocessableEntity)
		return
	}

	w.WriteHeader(http.StatusOK)
}
