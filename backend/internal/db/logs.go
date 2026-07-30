package db

import (
	"context"
	"fmt"
	"strings"
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

func UpdateLog(ctx context.Context, id string, userID, deviceID, action *string, createdAt *time.Time) error {
	query := `UPDATE logs SET `
	args := []any{}
	argIdx := 1
	sets := []string{}

	if userID != nil {
		sets = append(sets, fmt.Sprintf("user_id = $%d", argIdx))
		args = append(args, *userID)
		argIdx++
	}
	if deviceID != nil {
		sets = append(sets, fmt.Sprintf("device_id = $%d", argIdx))
		args = append(args, *deviceID)
		argIdx++
	}
	if action != nil {
		sets = append(sets, fmt.Sprintf("action = $%d", argIdx))
		args = append(args, *action)
		argIdx++
	}
	if createdAt != nil {
		sets = append(sets, fmt.Sprintf("created_at = $%d", argIdx))
		args = append(args, *createdAt)
		argIdx++
	}

	if len(sets) == 0 {
		return nil
	}

	query += strings.Join(sets, ", ")
	query += fmt.Sprintf(" WHERE id = $%d", argIdx)
	args = append(args, id)

	_, err := Pool.Exec(ctx, query, args...)
	return err
}

func DeleteLog(ctx context.Context, id string) error {
	_, err := Pool.Exec(
		ctx,
		`
		DELETE FROM logs WHERE id = $1
		`,
		id,
	)
	return err
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
