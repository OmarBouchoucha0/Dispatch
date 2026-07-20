package db

import (
	"context"
	"errors"
	"time"
)

type Device struct {
	ID        string
	Name      string
	CreatedAt time.Time
}

func GetDeviceByID(ctx context.Context, deviceID string) (*Device, error) {
	var device Device

	err := Pool.QueryRow(
		ctx,
		`
        SELECT id, name 
        FROM devices
        WHERE id = $1
        `,
		deviceID,
	).Scan(
		&device.ID,
		&device.Name,
	)
	if err != nil {
		return nil, err
	}

	return &device, nil
}

func GetDeviceByName(ctx context.Context, name string) (*Device, error) {
	var device Device

	err := Pool.QueryRow(
		ctx,
		`
        SELECT id, name 
        FROM devices
        WHERE name = $1
        `,
		name,
	).Scan(
		&device.ID,
		&device.Name,
	)
	if err != nil {
		return nil, err
	}

	return &device, nil
}

func GetDevices(ctx context.Context) ([]Device, error) {
	rows, err := Pool.Query(
		ctx,
		`
        SELECT id, name, created_at
        FROM devices
        `,
	)
	if err != nil {
		return nil, err
	}
	var devices []Device
	for rows.Next() {
		var device Device
		err := rows.Scan(
			&device.ID,
			&device.Name,
			&device.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		devices = append(devices, device)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}
	return devices, nil
}

func AddDevice(ctx context.Context, device Device) error {
	_, err := Pool.Exec(
		ctx,
		`
		INSERT INTO devices (
			name
		)
		VALUES ($1)
		`,
		device.Name,
	)
	if err != nil {
		return err
	}
	return nil
}

func RenameDevice(ctx context.Context, originalName string, newName string) error {
	cmd, err := Pool.Exec(
		ctx,
		`
		UPDATE devices
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
		return errors.New("device not found")
	}

	return nil
}

func DeleteDevice(ctx context.Context, name string) error {
	cmd, err := Pool.Exec(
		ctx,
		`
		DELETE FROM devices
		WHERE name = $1
		`,
		name,
	)
	if err != nil {
		return err
	}

	if cmd.RowsAffected() == 0 {
		return errors.New("device not found")
	}

	return nil
}
