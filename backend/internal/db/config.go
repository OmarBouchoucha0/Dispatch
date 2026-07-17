package db

import (
	"context"
	"encoding/json"
	"errors"
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

func DeleteConfig(ctx context.Context, name string) error {
	cmd, err := Pool.Exec(
		ctx,
		`
		DELETE FROM configs
		WHERE name = $1
		`,
		name,
	)
	if err != nil {
		return err
	}

	if cmd.RowsAffected() == 0 {
		return errors.New("config not found")
	}

	return nil
}
