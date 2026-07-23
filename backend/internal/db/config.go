package db

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"
)

type Config struct {
	ID       string
	DeviceID string
	UserID   string
	Name     string
	Content  json.RawMessage
}

func GetConfigs(ctx context.Context) ([]Config, error) {
	rows, err := Pool.Query(
		ctx,
		`
        SELECT id, user_id, device_id, name, content
        FROM configs
        `,
	)
	if err != nil {
		return nil, err
	}
	var configs []Config
	for rows.Next() {
		var cfg Config
		err := rows.Scan(
			&cfg.ID,
			&cfg.UserID,
			&cfg.DeviceID,
			&cfg.Name,
			&cfg.Content,
		)
		if err != nil {
			return nil, err
		}

		configs = append(configs, cfg)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return configs, nil
}

func AddConfig(ctx context.Context, config *Config) (string, error) {
	var action string
	err := Pool.QueryRow(
		ctx,
		`
		INSERT INTO configs (user_id, device_id, name, content)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (device_id, name)
		DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()
		RETURNING id,
			CASE WHEN created_at = updated_at THEN 'Created' ELSE 'Updated' END
		`,
		config.UserID,
		config.DeviceID,
		config.Name,
		config.Content,
	).Scan(&config.ID, &action)
	if err != nil {
		return "", err
	}
	return action, nil
}

func RenameConfig(ctx context.Context, originalName string, newName string) error {
	cmd, err := Pool.Exec(
		ctx,
		`
		UPDATE configs
		SET name = $1,
		    updated_at = NOW()
		WHERE name = $2
		`,
		newName,
		originalName,
	)
	if err != nil {
		return err
	}

	if cmd.RowsAffected() == 0 {
		return errors.New("config not found")
	}

	return nil
}

func GetConfigByID(ctx context.Context, id string) (Config, error) {
	var cfg Config
	err := Pool.QueryRow(
		ctx,
		`
		SELECT id, user_id, device_id, name, content
		FROM configs
		WHERE id = $1
		`,
		id,
	).Scan(
		&cfg.ID,
		&cfg.UserID,
		&cfg.DeviceID,
		&cfg.Name,
		&cfg.Content,
	)
	if err != nil {
		return Config{}, err
	}
	return cfg, nil
}

func DeleteConfig(ctx context.Context, id string) error {
	cmd, err := Pool.Exec(
		ctx,
		`
		DELETE FROM configs
		WHERE id = $1
		`,
		id,
	)
	if err != nil {
		return err
	}

	if cmd.RowsAffected() == 0 {
		return errors.New("config not found")
	}

	return nil
}

type CommitChange struct {
	DeviceID string
	Name     string
	Content  json.RawMessage
}

func CommitConfigs(ctx context.Context, userID string, changed []CommitChange, deleted []string) error {
	tx, err := Pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	for _, c := range changed {
		_, err := tx.Exec(ctx, `
			INSERT INTO configs (user_id, device_id, name, content)
			VALUES ($1, $2, $3, $4)
			ON CONFLICT (device_id, name)
			DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()
		`, userID, c.DeviceID, c.Name, c.Content)
		if err != nil {
			return fmt.Errorf("upsert config: %w", err)
		}

		_, err = tx.Exec(ctx, `
			INSERT INTO logs (user_id, device_id, action, created_at)
			VALUES ($1, $2, $3, $4)
		`, userID, c.DeviceID, "Updated", time.Now())
		if err != nil {
			return fmt.Errorf("log changed: %w", err)
		}
	}

	for _, id := range deleted {
		var deviceID string
		err := tx.QueryRow(ctx, `SELECT device_id FROM configs WHERE id = $1`, id).Scan(&deviceID)
		if err != nil {
			return fmt.Errorf("config not found: %s", id)
		}

		_, err = tx.Exec(ctx, `DELETE FROM configs WHERE id = $1`, id)
		if err != nil {
			return fmt.Errorf("delete config: %w", err)
		}

		_, err = tx.Exec(ctx, `
			INSERT INTO logs (user_id, device_id, action, created_at)
			VALUES ($1, $2, $3, $4)
		`, userID, deviceID, "Deleted", time.Now())
		if err != nil {
			return fmt.Errorf("log deleted: %w", err)
		}
	}

	return tx.Commit(ctx)
}
