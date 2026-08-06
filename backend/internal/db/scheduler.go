package db

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
)

func StartScheduler(ctx context.Context, interval time.Duration) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()
	slog.Info("scheduler started", "interval", interval)

	for {
		select {
		case <-ticker.C:
			deployPending(ctx)
		case <-ctx.Done():
			slog.Info("scheduler stopped")
			return
		}
	}
}

func deployPending(ctx context.Context) {
	events, err := GetPendingEvents(ctx)
	if err != nil {
		slog.Error("scheduler: get pending events", "error", err)
		return
	}

	for _, e := range events {
		if err := DeployEvent(ctx, e); err != nil {
			slog.Error("scheduler: deploy event", "id", e.ID, "error", err)
		}
	}
}

func DeployEvent(ctx context.Context, event Event) error {
	tx, err := Pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	type snapshotRow struct {
		DeviceID   string          `json:"device_id"`
		DeviceName string          `json:"device_name"`
		Name       string          `json:"name"`
		Content    json.RawMessage `json:"content"`
	}

	var snapshot []snapshotRow
	if event.ConfigsBefore != nil && len(*event.ConfigsBefore) > 0 && string(*event.ConfigsBefore) != "null" {
		if err := json.Unmarshal(*event.ConfigsBefore, &snapshot); err != nil {
			return fmt.Errorf("parse configs_before: %w", err)
		}
	} else {
		rows, err := tx.Query(
			ctx,
			`
			SELECT c.device_id, COALESCE(d.name, ''), c.name, c.content
			FROM configs c
			LEFT JOIN devices d ON d.id = c.device_id
			`,
		)
		if err != nil {
			return fmt.Errorf("snapshot configs: %w", err)
		}

		for rows.Next() {
			var r snapshotRow
			if err := rows.Scan(&r.DeviceID, &r.DeviceName, &r.Name, &r.Content); err != nil {
				rows.Close()
				return fmt.Errorf("scan snapshot: %w", err)
			}
			snapshot = append(snapshot, r)
		}
		rows.Close()

		if err := rows.Err(); err != nil {
			return fmt.Errorf("snapshot rows: %w", err)
		}
	}

	type configItem struct {
		DeviceID   string          `json:"device_id"`
		DeviceName string          `json:"device_name"`
		Name       string          `json:"name"`
		Content    json.RawMessage `json:"content"`
	}

	var after []configItem
	if err := json.Unmarshal(event.ConfigsAfter, &after); err != nil {
		return fmt.Errorf("parse configs_after: %w", err)
	}

	tempToReal, err := applyDeviceChanges(ctx, tx, event)
	if err != nil {
		return err
	}

	if len(tempToReal) > 0 {
		remapped := make([]configItem, len(after))
		for i, cfg := range after {
			if realID, ok := tempToReal[cfg.DeviceID]; ok {
				cfg.DeviceID = realID
			}
			remapped[i] = cfg
		}
		after = remapped
	}

	_, err = tx.Exec(ctx, `DELETE FROM configs`)
	if err != nil {
		return fmt.Errorf("delete all configs: %w", err)
	}

	for _, cfg := range after {
		_, err := tx.Exec(
			ctx,
			`
			INSERT INTO configs (user_id, device_id, name, content)
			VALUES ($1, $2, $3, $4)
			`,
			event.UserID,
			cfg.DeviceID,
			cfg.Name,
			cfg.Content,
		)
		if err != nil {
			return fmt.Errorf("insert config %s/%s: %w", cfg.DeviceID, cfg.Name, err)
		}
	}

	beforeMap := make(map[string]struct{})
	for _, s := range snapshot {
		beforeMap[fmt.Sprintf("%s::%s", s.DeviceID, s.Name)] = struct{}{}
	}

	afterMap := make(map[string]struct{})
	for _, a := range after {
		afterMap[fmt.Sprintf("%s::%s", a.DeviceID, a.Name)] = struct{}{}
	}

	for _, s := range snapshot {
		key := fmt.Sprintf("%s::%s", s.DeviceID, s.Name)
		if _, exists := afterMap[key]; !exists {
			if _, err := tx.Exec(ctx, `INSERT INTO logs (user_id, device_id, action) VALUES ($1, $2, $3)`, event.UserID, s.DeviceID, "Deleted"); err != nil {
				return fmt.Errorf("log delete %s/%s: %w", s.DeviceID, s.Name, err)
			}
		}
	}

	for _, a := range after {
		key := fmt.Sprintf("%s::%s", a.DeviceID, a.Name)
		_, existed := beforeMap[key]
		action := "Created"
		if existed {
			action = "Updated"
		}
		if _, err := tx.Exec(ctx, `INSERT INTO logs (user_id, device_id, action) VALUES ($1, $2, $3)`, event.UserID, a.DeviceID, action); err != nil {
			return fmt.Errorf("log %s %s/%s: %w", action, a.DeviceID, a.Name, err)
		}
	}

	snapshotJSON, err := json.Marshal(snapshot)
	if err != nil {
		return fmt.Errorf("marshal snapshot: %w", err)
	}

	if err := UpdateEventDeployed(ctx, event.ID, snapshotJSON); err != nil {
		return fmt.Errorf("update event: %w", err)
	}

	return tx.Commit(ctx)
}

type deviceSnapshot struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

func applyDeviceChanges(ctx context.Context, tx pgx.Tx, event Event) (map[string]string, error) {
	if len(event.DevicesAfter) == 0 || string(event.DevicesAfter) == "null" {
		return nil, nil
	}

	var devicesBefore []deviceSnapshot
	if event.DevicesBefore != nil && len(*event.DevicesBefore) > 0 && string(*event.DevicesBefore) != "null" {
		if err := json.Unmarshal(*event.DevicesBefore, &devicesBefore); err != nil {
			return nil, fmt.Errorf("parse devices_before: %w", err)
		}
	}
	var devicesAfter []deviceSnapshot
	if err := json.Unmarshal(event.DevicesAfter, &devicesAfter); err != nil {
		return nil, fmt.Errorf("parse devices_after: %w", err)
	}

	afterByID := make(map[string]deviceSnapshot)
	for _, d := range devicesAfter {
		afterByID[d.ID] = d
	}

	for _, b := range devicesBefore {
		if _, exists := afterByID[b.ID]; exists {
			continue
		}
		if _, err := tx.Exec(ctx, `DELETE FROM devices WHERE id = $1`, b.ID); err != nil {
			return nil, fmt.Errorf("delete device %s: %w", b.ID, err)
		}
		if _, err := tx.Exec(ctx, `INSERT INTO logs (user_id, device_id, action) VALUES ($1, $2, $3)`, event.UserID, b.ID, "Deleted"); err != nil {
			return nil, fmt.Errorf("log delete device %s: %w", b.ID, err)
		}
	}

	for _, b := range devicesBefore {
		a, exists := afterByID[b.ID]
		if !exists || a.Name == b.Name {
			continue
		}
		if _, err := tx.Exec(ctx, `UPDATE devices SET name = $1 WHERE id = $2`, a.Name, b.ID); err != nil {
			return nil, fmt.Errorf("rename device %s: %w", b.ID, err)
		}
		if _, err := tx.Exec(ctx, `INSERT INTO logs (user_id, device_id, action) VALUES ($1, $2, $3)`, event.UserID, b.ID, "Renamed"); err != nil {
			return nil, fmt.Errorf("log rename device %s: %w", b.ID, err)
		}
	}

	tempToReal := make(map[string]string)
	for _, a := range devicesAfter {
		if !strings.HasPrefix(a.ID, "local-") {
			continue
		}
		var newID string
		if err := tx.QueryRow(ctx, `INSERT INTO devices (name) VALUES ($1) RETURNING id`, a.Name).Scan(&newID); err != nil {
			return nil, fmt.Errorf("create device %s: %w", a.Name, err)
		}
		tempToReal[a.ID] = newID
		if _, err := tx.Exec(ctx, `INSERT INTO logs (user_id, device_id, action) VALUES ($1, $2, $3)`, event.UserID, newID, "Created"); err != nil {
			return nil, fmt.Errorf("log create device %s: %w", a.Name, err)
		}
	}

	return tempToReal, nil
}
