package db

import (
	"context"
	"log/slog"

	"github.com/jackc/pgx/v5/pgxpool"
)

var Pool *pgxpool.Pool

func Connect(ctx context.Context, url string) error {
	db, err := pgxpool.New(
		ctx,
		url,
	)
	if err != nil {
		slog.Error("Unable to create database pool", "error", err)
		return err
	}

	if err := db.Ping(ctx); err != nil {
		slog.Error("Unable to connect to database", "error", err)
		return err
	}
	slog.Info("Database connected")
	Pool = db
	return nil
}
