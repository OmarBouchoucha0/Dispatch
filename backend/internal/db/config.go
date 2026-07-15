package db

import (
	"context"
	"encoding/json"
)

type Config struct {
	ID       string
	DeviceID string
	UserID   string
	Content  json.RawMessage
}

func GetConfigByDeviceID(ctx context.Context, deviceID string) (*Config, error) {
	var cfg Config

	err := Pool.QueryRow(
		ctx,
		`
        SELECT id, user_id, device_id, content
        FROM configs
        WHERE device_id = $1
        `,
		deviceID,
	).Scan(
		&cfg.ID,
		&cfg.UserID,
		&cfg.DeviceID,
		&cfg.Content,
	)
	if err != nil {
		return nil, err
	}

	return &cfg, nil
}

func GetConfigs(ctx context.Context) ([]Config, error) {
	rows, err := Pool.Query(
		ctx,
		`
        SELECT id, user_id, device_id, content
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

func AddConfig(ctx context.Context, config Config) (string, error) {
	var created bool
	err := Pool.QueryRow(
		ctx,
		`
		INSERT INTO configs (user_id, device_id, content)
		VALUES ($1, $2, $3)
		ON CONFLICT (device_id) DO UPDATE
			SET user_id = $1, content = $3, updated_at = NOW()
		RETURNING (xmax = 0)
		`,
		config.UserID,
		config.DeviceID,
		config.Content,
	).Scan(&created)
	if err != nil {
		return "", err
	}
	if created {
		return "Created", nil
	}
	return "Updated", nil
}
