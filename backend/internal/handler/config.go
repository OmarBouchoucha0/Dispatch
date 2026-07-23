package handler

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/OmarBouchoucha0/Dispatch/backend/internal/auth"
	"github.com/OmarBouchoucha0/Dispatch/backend/internal/db"
	"github.com/go-chi/chi/v5"
)

type ConfigListResponse struct {
	ID         string          `json:"id"`
	DeviceID   string          `json:"deviceID"`
	DeviceName string          `json:"deviceName"`
	Name       string          `json:"name"`
	Content    json.RawMessage `json:"content"`
}

func ListConfigs(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	configs, err := db.GetConfigs(ctx)
	if err != nil {
		slog.Error("coudnt get configs", "error", err)
		http.Error(w, http.StatusText(http.StatusUnprocessableEntity), http.StatusUnprocessableEntity)
		return
	}

	var res []ConfigListResponse
	for _, config := range configs {
		device, err := db.GetDeviceByID(ctx, config.DeviceID)
		if err != nil {
			slog.Error("get device", "error", err)
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			return
		}

		res = append(res, ConfigListResponse{
			ID:         config.ID,
			DeviceID:   device.ID,
			DeviceName: device.Name,
			Name:       config.Name,
			Content:    config.Content,
		})
	}

	w.Header().Set("Content-Type", "application/json")

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

type CreateConfigRequest struct {
	DeviceID string          `json:"device_id"`
	Name     string          `json:"name"`
	Content  json.RawMessage `json:"content"`
}

func AddConfig(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	claims, ok := ctx.Value(auth.UserKey).(*auth.Claims)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req CreateConfigRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		slog.Error("json decoding", "error", err)
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}
	config := &db.Config{
		UserID:   claims.UserID,
		DeviceID: req.DeviceID,
		Name:     req.Name,
		Content:  req.Content,
	}
	action, err := db.AddConfig(ctx, config)
	if err != nil {
		slog.Error("coudnt add config", "error", err)
		http.Error(w, http.StatusText(http.StatusUnprocessableEntity), http.StatusUnprocessableEntity)
		return
	}
	log := db.Log{
		UserID:   claims.UserID,
		DeviceID: req.DeviceID,
		Action:   action,
	}
	err = db.AddLog(ctx, log)
	if err != nil {
		slog.Error("coudnt add log", "error", err)
		http.Error(w, http.StatusText(http.StatusUnprocessableEntity), http.StatusUnprocessableEntity)
		return
	}

	device, err := db.GetDeviceByID(ctx, req.DeviceID)
	if err != nil {
		slog.Error("get device", "error", err)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ConfigListResponse{
		ID:         config.ID,
		DeviceID:   device.ID,
		DeviceName: device.Name,
		Name:       config.Name,
		Content:    config.Content,
	})
	slog.Info("config added")
}

type RenameConfigRequest struct {
	DeviceID string `json:"device_id"`
	Name     string `json:"name"`
	NewName  string `json:"new_name"`
}

func RenameConfig(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	claims, ok := ctx.Value(auth.UserKey).(*auth.Claims)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req RenameConfigRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		slog.Error("json decoding", "error", err)
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}
	err = db.RenameConfig(ctx, req.Name, req.NewName)
	if err != nil {
		slog.Error("coudnt add config", "error", err)
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
	slog.Info("config renamed")
}

type DeleteConfigRequest struct {
	DeviceID string `json:"device_id"`
	Name     string `json:"name"`
}

func DeleteConfig(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	claims, ok := ctx.Value(auth.UserKey).(*auth.Claims)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "missing id", http.StatusBadRequest)
		return
	}

	config, err := db.GetConfigByID(ctx, id)
	if err != nil {
		slog.Error("config not found", "error", err)
		http.Error(w, http.StatusText(http.StatusNotFound), http.StatusNotFound)
		return
	}

	err = db.DeleteConfig(ctx, id)
	if err != nil {
		slog.Error("couldnt delete config", "error", err)
		http.Error(w, http.StatusText(http.StatusUnprocessableEntity), http.StatusUnprocessableEntity)
		return
	}

	log := db.Log{
		UserID:   claims.UserID,
		DeviceID: config.DeviceID,
		Action:   "Deleted",
	}
	err = db.AddLog(ctx, log)
	if err != nil {
		slog.Error("couldnt add log", "error", err)
		http.Error(w, http.StatusText(http.StatusUnprocessableEntity), http.StatusUnprocessableEntity)
		return
	}
	slog.Info("config deleted")
}

type CommitConfigItem struct {
	DeviceID string          `json:"device_id"`
	Name     string          `json:"name"`
	Content  json.RawMessage `json:"content"`
}

type CommitConfigsRequest struct {
	Changed []CommitConfigItem `json:"changed"`
	Deleted []string           `json:"deleted"`
}

func CommitConfigs(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	claims, ok := ctx.Value(auth.UserKey).(*auth.Claims)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req CommitConfigsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		slog.Error("json decoding", "error", err)
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}

	changed := make([]db.CommitChange, len(req.Changed))
	for i, c := range req.Changed {
		changed[i] = db.CommitChange{
			DeviceID: c.DeviceID,
			Name:     c.Name,
			Content:  c.Content,
		}
	}

	if err := db.CommitConfigs(ctx, claims.UserID, changed, req.Deleted); err != nil {
		slog.Error("commit failed", "error", err)
		http.Error(w, err.Error(), http.StatusUnprocessableEntity)
		return
	}

	w.WriteHeader(http.StatusOK)
	slog.Info("configs committed")
}
