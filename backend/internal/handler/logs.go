package handler

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/OmarBouchoucha0/Dispatch/backend/internal/db"
)

type LogsListResponse struct {
	ID         string `json:"id"`
	UserName   string `json:"user_name"`
	DeviceName string `json:"device_name"`
	Action     string `json:"action"`
	CreatedAt  string `json:"created_at"`
}

func ListLogs(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	loc := getLocation(r)

	logs, err := db.GetLogs(ctx)
	if err != nil {
		slog.Error("couldn't get logs", "error", err)
		http.Error(w, http.StatusText(http.StatusUnprocessableEntity), http.StatusUnprocessableEntity)
		return
	}

	var res []LogsListResponse

	for _, log := range logs {
		user, err := db.GetUserByID(ctx, log.UserID)
		if err != nil {
			slog.Error("get user", "error", err)
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			return
		}

		device, err := db.GetDeviceByID(ctx, log.DeviceID)
		if err != nil {
			slog.Error("get device", "error", err)
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			return
		}

		userName := user.FirstName
		if userName == "" {
			userName = user.Email
		}
		res = append(res, LogsListResponse{
			ID:         log.ID,
			UserName:   userName,
			DeviceName: device.Name,
			Action:     log.Action,
			CreatedAt:  log.CreatedAt.In(loc).Format("2006-01-02 15:04:05"),
		})
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	err = json.NewEncoder(w).Encode(res)
	if err != nil {
		slog.Error("json encoding", "error", err)
	}
}

func UpdateLog(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := chi.URLParam(r, "id")

	var req struct {
		UserID    *string `json:"user_id"`
		DeviceID  *string `json:"device_id"`
		Action    *string `json:"action"`
		CreatedAt *string `json:"created_at"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		slog.Error("json decoding", "error", err)
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}

	var createdAt *time.Time
	if req.CreatedAt != nil {
		t, err := time.Parse("2006-01-02 15:04:05", *req.CreatedAt)
		if err != nil {
			slog.Error("parse created_at", "error", err)
			http.Error(w, "invalid created_at format", http.StatusBadRequest)
			return
		}
		createdAt = &t
	}

	if err := db.UpdateLog(ctx, id, req.UserID, req.DeviceID, req.Action, createdAt); err != nil {
		slog.Error("update log", "error", err)
		http.Error(w, http.StatusText(http.StatusUnprocessableEntity), http.StatusUnprocessableEntity)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func DeleteLog(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := chi.URLParam(r, "id")

	if err := db.DeleteLog(ctx, id); err != nil {
		slog.Error("delete log", "error", err)
		http.Error(w, http.StatusText(http.StatusUnprocessableEntity), http.StatusUnprocessableEntity)
		return
	}

	w.WriteHeader(http.StatusOK)
}
