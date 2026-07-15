package db

import (
	"context"
	"time"
)

type Log struct {
	ID        string
	UserID    string
	DeviceID  string
	Action    string
	CreatedAt time.Time
}

func AddLog(ctx context.Context, log Log) error {
	_, err := Pool.Exec(
		ctx,
		`
		INSERT INTO logs (
			user_id,
			device_id,
			action
		)
		VALUES ($1, $2, $3)
		`,
		log.UserID,
		log.DeviceID,
		log.Action,
	)
	if err != nil {
		return err
	}
	return nil
}

func GetLogs(ctx context.Context) ([]Log, error) {
	rows, err := Pool.Query(
		ctx,
		`
        SELECT id, user_id, device_id, action, created_at
        FROM logs
        ORDER BY created_at DESC
        `,
	)
	if err != nil {
		return nil, err
	}
	var logs []Log
	for rows.Next() {
		var log Log
		err := rows.Scan(
			&log.ID,
			&log.UserID,
			&log.DeviceID,
			&log.Action,
			&log.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		logs = append(logs, log)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}
	return logs, nil
}
