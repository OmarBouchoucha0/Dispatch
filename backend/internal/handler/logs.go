package handler

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/OmarBouchoucha0/Dispatch/backend/internal/db"
)

type LogsListResponse struct {
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
