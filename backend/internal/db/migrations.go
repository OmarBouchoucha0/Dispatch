package db

import (
	"fmt"
	"log/slog"
	"strings"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

func RunMigrations(databaseURL string) error {
	if !strings.Contains(databaseURL, "sslmode=") {
		databaseURL += "?sslmode=disable"
	}
	m, err := migrate.New(
		"file://migrations",
		databaseURL,
	)
	if err != nil {
		return fmt.Errorf("create migrator: %w", err)
	}

	defer m.Close()

	err = m.Up()

	if err != nil && err != migrate.ErrNoChange {
		return fmt.Errorf("run migrations: %w", err)
	}

	slog.Info("Database migrations completed")

	return nil
}
