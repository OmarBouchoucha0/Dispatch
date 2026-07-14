package db

import (
	"context"
)

type Device struct {
	ID   string
	Name string
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
        SELECT id, name
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
