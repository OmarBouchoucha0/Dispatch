package handler

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"time"

	"github.com/OmarBouchoucha0/Dispatch/backend/internal/auth"
	"github.com/OmarBouchoucha0/Dispatch/backend/internal/db"
	"github.com/go-chi/chi/v5"
)

type ScheduleEventRequest struct {
	Name        string          `json:"name"`
	ScheduledAt time.Time       `json:"scheduled_at"`
	ConfigsAfter json.RawMessage `json:"configs_after"`
}

type EventResponse struct {
	ID            string           `json:"id"`
	Name          string           `json:"name"`
	ConfigsBefore *json.RawMessage `json:"configs_before"`
	ConfigsAfter  json.RawMessage  `json:"configs_after"`
	ScheduledAt   time.Time        `json:"scheduled_at"`
	Status        string           `json:"status"`
	CreatedAt     time.Time        `json:"created_at"`
	UserID        string           `json:"user_id"`
	DeployedAt    *time.Time       `json:"deployed_at"`
}

func eventToResponse(e *db.Event, r *http.Request) EventResponse {
	loc := getLocation(r)
	return EventResponse{
		ID:            e.ID,
		Name:          e.Name,
		ConfigsBefore: e.ConfigsBefore,
		ConfigsAfter:  e.ConfigsAfter,
		ScheduledAt:   e.ScheduledAt.In(loc),
		Status:        e.Status,
		CreatedAt:     e.CreatedAt.In(loc),
		UserID:        e.UserID,
		DeployedAt:    convertedDeployedAt(e.DeployedAt, loc),
	}
}

func convertedDeployedAt(t *time.Time, loc *time.Location) *time.Time {
	if t == nil {
		return nil
	}
	converted := t.In(loc)
	return &converted
}

func ScheduleEvent(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	claims, ok := ctx.Value(auth.UserKey).(*auth.Claims)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req ScheduleEventRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		slog.Error("json decoding", "error", err)
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}

	if req.Name == "" {
		http.Error(w, "name is required", http.StatusBadRequest)
		return
	}

	immediate := req.ScheduledAt.IsZero()

	if !immediate {
		if req.ScheduledAt.Before(time.Now().UTC()) {
			http.Error(w, "scheduled_at must be in the future", http.StatusUnprocessableEntity)
			return
		}
	} else {
		req.ScheduledAt = time.Now().UTC()
	}

	if len(req.ConfigsAfter) == 0 || string(req.ConfigsAfter) == "null" {
		http.Error(w, "configs_after is required", http.StatusBadRequest)
		return
	}

	type rawItem struct {
		DeviceID string          `json:"device_id"`
		Name     string          `json:"name"`
		Content  json.RawMessage `json:"content"`
	}

	var items []rawItem
	if err := json.Unmarshal(req.ConfigsAfter, &items); err != nil {
		http.Error(w, "invalid configs_after", http.StatusBadRequest)
		return
	}

	type enrichedItem struct {
		DeviceID   string          `json:"device_id"`
		DeviceName string          `json:"device_name"`
		Name       string          `json:"name"`
		Content    json.RawMessage `json:"content"`
	}

	enriched := make([]enrichedItem, len(items))
	for i, item := range items {
		device, err := db.GetDeviceByID(ctx, item.DeviceID)
		deviceName := ""
		if err == nil {
			deviceName = device.Name
		}

		enriched[i] = enrichedItem{
			DeviceID:   item.DeviceID,
			DeviceName: deviceName,
			Name:       item.Name,
			Content:    item.Content,
		}
	}

	enrichedJSON, err := json.Marshal(enriched)
	if err != nil {
		slog.Error("marshal enriched configs", "error", err)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}

	event := &db.Event{
		Name:         req.Name,
		ConfigsAfter: enrichedJSON,
		ScheduledAt:  req.ScheduledAt,
		UserID:       claims.UserID,
	}

	if err := db.CreateEvent(ctx, event); err != nil {
		slog.Error("create event", "error", err)
		http.Error(w, http.StatusText(http.StatusUnprocessableEntity), http.StatusUnprocessableEntity)
		return
	}

	if immediate {
		if err := db.DeployEvent(ctx, *event); err != nil {
			slog.Error("immediate deploy", "error", err)
			http.Error(w, "event created but deploy failed", http.StatusInternalServerError)
			return
		}
		fresh, err := db.GetEventByID(ctx, event.ID)
		if err != nil {
			slog.Error("re-read event after deploy", "error", err)
			http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			return
		}
		event = fresh
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(eventToResponse(event, r))
	slog.Info("event scheduled", "id", event.ID)
}

func ListEvents(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	events, err := db.GetEvents(ctx)
	if err != nil {
		slog.Error("get events", "error", err)
		http.Error(w, http.StatusText(http.StatusUnprocessableEntity), http.StatusUnprocessableEntity)
		return
	}

	res := make([]EventResponse, len(events))
	for i, e := range events {
		res[i] = eventToResponse(&e, r)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

func CancelEvent(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "missing id", http.StatusBadRequest)
		return
	}

	event, err := db.GetEventByID(ctx, id)
	if err != nil {
		slog.Error("event not found", "error", err)
		http.Error(w, http.StatusText(http.StatusNotFound), http.StatusNotFound)
		return
	}

	if event.Status != "pending" {
		http.Error(w, "can only cancel pending events", http.StatusUnprocessableEntity)
		return
	}

	if err := db.CancelEvent(ctx, id); err != nil {
		slog.Error("cancel event", "error", err)
		http.Error(w, http.StatusText(http.StatusUnprocessableEntity), http.StatusUnprocessableEntity)
		return
	}

	w.WriteHeader(http.StatusOK)
	slog.Info("event cancelled", "id", id)
}
