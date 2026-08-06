package db

import (
	"context"
	"encoding/json"
	"time"
)

type Event struct {
	ID            string
	Name          string
	ConfigsBefore *json.RawMessage
	ConfigsAfter  json.RawMessage
	DevicesBefore *json.RawMessage
	DevicesAfter  json.RawMessage
	ScheduledAt   time.Time
	Status        string
	CreatedAt     time.Time
	UserID        string
	DeployedAt    *time.Time
}

func CreateEvent(ctx context.Context, event *Event) error {
	return Pool.QueryRow(
		ctx,
		`
		INSERT INTO events (name, configs_before, configs_after, devices_before, devices_after, scheduled_at, user_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, created_at, status
		`,
		event.Name,
		event.ConfigsBefore,
		event.ConfigsAfter,
		event.DevicesBefore,
		event.DevicesAfter,
		event.ScheduledAt,
		event.UserID,
	).Scan(&event.ID, &event.CreatedAt, &event.Status)
}

func GetEvents(ctx context.Context) ([]Event, error) {
	rows, err := Pool.Query(
		ctx,
		`
		SELECT id, name, configs_before, configs_after, devices_before, devices_after, scheduled_at,
		       status, created_at, user_id, deployed_at
		FROM events
		ORDER BY scheduled_at DESC
		`,
	)
	if err != nil {
		return nil, err
	}

	var events []Event
	for rows.Next() {
		var e Event
		err := rows.Scan(
			&e.ID,
			&e.Name,
			&e.ConfigsBefore,
			&e.ConfigsAfter,
			&e.DevicesBefore,
			&e.DevicesAfter,
			&e.ScheduledAt,
			&e.Status,
			&e.CreatedAt,
			&e.UserID,
			&e.DeployedAt,
		)
		if err != nil {
			return nil, err
		}
		events = append(events, e)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return events, nil
}

func GetPendingEvents(ctx context.Context) ([]Event, error) {
	rows, err := Pool.Query(
		ctx,
		`
		SELECT id, name, configs_before, configs_after, devices_before, devices_after, scheduled_at,
		       status, created_at, user_id, deployed_at
		FROM events
		WHERE status = 'pending' AND scheduled_at <= NOW()
		ORDER BY scheduled_at ASC
		`,
	)
	if err != nil {
		return nil, err
	}

	var events []Event
	for rows.Next() {
		var e Event
		err := rows.Scan(
			&e.ID,
			&e.Name,
			&e.ConfigsBefore,
			&e.ConfigsAfter,
			&e.DevicesBefore,
			&e.DevicesAfter,
			&e.ScheduledAt,
			&e.Status,
			&e.CreatedAt,
			&e.UserID,
			&e.DeployedAt,
		)
		if err != nil {
			return nil, err
		}
		events = append(events, e)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return events, nil
}

func GetEventByID(ctx context.Context, id string) (*Event, error) {
	var e Event
	err := Pool.QueryRow(
		ctx,
		`
		SELECT id, name, configs_before, configs_after, devices_before, devices_after, scheduled_at,
		       status, created_at, user_id, deployed_at
		FROM events
		WHERE id = $1
		`,
		id,
	).Scan(
		&e.ID,
		&e.Name,
		&e.ConfigsBefore,
		&e.ConfigsAfter,
		&e.DevicesBefore,
		&e.DevicesAfter,
		&e.ScheduledAt,
		&e.Status,
		&e.CreatedAt,
		&e.UserID,
		&e.DeployedAt,
	)
	if err != nil {
		return nil, err
	}
	return &e, nil
}

func UpdateEventDeployed(ctx context.Context, id string, configsBefore json.RawMessage) error {
	_, err := Pool.Exec(
		ctx,
		`
		UPDATE events
		SET status = 'deployed',
		    configs_before = $1,
		    deployed_at = NOW()
		WHERE id = $2
		`,
		configsBefore,
		id,
	)
	return err
}

func CancelEvent(ctx context.Context, id string) error {
	_, err := Pool.Exec(
		ctx,
		`
		UPDATE events
		SET status = 'cancelled'
		WHERE id = $1 AND status = 'pending'
		`,
		id,
	)
	return err
}
