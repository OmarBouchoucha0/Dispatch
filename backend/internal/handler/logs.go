package handler

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/OmarBouchoucha0/Dispatch/backend/internal/db"
)

type LogsListResponse struct {
	UserName   string
	DeviceName string
	Action     string
	CreatedAt  string
}

func ListLogs(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	logs, err := db.GetLogs(ctx)
	if err != nil {
		slog.Error("couldn't get logs", "error", err)
		http.Error(w, http.StatusText(422), http.StatusUnprocessableEntity)
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

		res = append(res, LogsListResponse{
			UserName:   user.FirstName,
			DeviceName: device.Name,
			Action:     log.Action,
			CreatedAt:  log.CreatedAt.Format("2006-01-02 15:04:05"),
		})
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	err = json.NewEncoder(w).Encode(res)
	if err != nil {
		slog.Error("json encoding", "error", err)
	}
}
