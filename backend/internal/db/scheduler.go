package db

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"time"
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

	type snapshotRow struct {
		DeviceID   string          `json:"device_id"`
		DeviceName string          `json:"device_name"`
		Name       string          `json:"name"`
		Content    json.RawMessage `json:"content"`
	}

	var snapshot []snapshotRow
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

	_, err = tx.Exec(ctx, `DELETE FROM configs`)
	if err != nil {
		return fmt.Errorf("delete all configs: %w", err)
	}

	var after []struct {
		DeviceID   string          `json:"device_id"`
		DeviceName string          `json:"device_name"`
		Name       string          `json:"name"`
		Content    json.RawMessage `json:"content"`
	}
	if err := json.Unmarshal(event.ConfigsAfter, &after); err != nil {
		return fmt.Errorf("parse configs_after: %w", err)
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
