package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	ctx := context.Background()

	db, err := pgxpool.New(
		ctx,
		"postgres://omar:omar2001@localhost:5432/dispatch",
	)
	if err != nil {
		slog.Error("Unable to create database pool", "error", err)
		os.Exit(1)
	}

	defer db.Close()

	if err := db.Ping(ctx); err != nil {
		slog.Error("Unable to connect to database", "error", err)
		os.Exit(1)
	}

	slog.Info("Database connected")

	r := chi.NewRouter()

	r.Use(middleware.Logger)

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("welcome"))
	})

	slog.Info("Starteing Server", "port", "8080")

	if err := http.ListenAndServe(":8080", r); err != nil {
		slog.Error("Server has failed to start", "error", err)
		os.Exit(1)
	}
}
