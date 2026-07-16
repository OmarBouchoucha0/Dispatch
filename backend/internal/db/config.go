package db

import (
	"context"
	"encoding/json"
)

type Config struct {
	ID       string
	DeviceID string
	UserID   string
	Name     string
	Content  json.RawMessage
}

func GetConfigByDeviceID(ctx context.Context, deviceID string) ([]Config, error) {
	rows, err := Pool.Query(
		ctx,
		`
        SELECT id, user_id, device_id, name, content
        FROM configs
        WHERE device_id = $1
        `,
		deviceID,
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

func AddConfig(ctx context.Context, config *Config) error {
	err := Pool.QueryRow(
		ctx,
		`
		INSERT INTO configs (user_id, device_id, name, content)
		VALUES ($1, $2, $3, $4)
		RETURNING id
		`,
		config.UserID,
		config.DeviceID,
		config.Name,
		config.Content,
	).Scan(&config.ID)
	if err != nil {
		return err
	}
	return nil
}
