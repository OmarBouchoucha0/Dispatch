package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/OmarBouchoucha0/Dispatch/backend/internal/auth"
	"github.com/OmarBouchoucha0/Dispatch/backend/internal/db"
	"github.com/OmarBouchoucha0/Dispatch/backend/internal/handler"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func main() {
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	ctx := context.Background()
	dbURL := getEnv("DATABASE_URL", "")
	if dbURL == "" {
		dbURL = fmt.Sprintf(
			"postgres://%s:%s@%s:%s/%s",
			getEnv("DB_USER", "omar"),
			getEnv("DB_PASSWORD", "omar2001"),
			getEnv("DB_HOST", "localhost"),
			getEnv("DB_PORT", "5432"),
			getEnv("DB_NAME", "dispatch"),
		)
	}
	slog.Info("Connecting to database")
	if err := db.Connect(ctx, dbURL); err != nil {
		slog.Error("Database failed", "error", err)
		return
	}
	defer db.Pool.Close()
	h := mount()
	addr := fmt.Sprintf("%s:%s", getEnv("HOST", "0.0.0.0"), getEnv("PORT", "8080"))
	if err := run(h, addr); err != nil {
		slog.Error("Server has failed to start", "error", err)
		os.Exit(1)
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func run(h http.Handler, a string) error {
	srv := &http.Server{
		Addr:         a,
		Handler:      h,
		WriteTimeout: time.Second * 30,
		ReadTimeout:  time.Second * 30,
		IdleTimeout:  time.Second * 60,
	}
	slog.Info("Server starting", "addr", srv.Addr)
	return srv.ListenAndServe()
}

func mount() http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.ClientIPFromRemoteAddr)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{
			"http://localhost:3000",
			"https://dispatch-h0d4hu3u2-omarbouchoucha0s-projects.vercel.app",
		},
		AllowedMethods: []string{
			"GET",
			"POST",
			"PUT",
			"DELETE",
			"OPTIONS",
		},
		AllowedHeaders: []string{
			"Accept",
			"Content-Type",
			"Authorization",
		},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Use(middleware.Timeout(60 * time.Second))

	r.Route("/user", func(r chi.Router) {
		r.Post("/login", handler.Login)
		r.Post("/signup", handler.Signup)
		r.Get("/logout", handler.Logout)

		r.Group(func(r chi.Router) {
			r.Use(auth.Middleware)
			r.Get("/me", handler.Me)
			r.Get("/", handler.ListUsers)
			r.Post("/", handler.AddUser)
		})
	})

	r.Route("/config", func(r chi.Router) {
		r.Use(auth.Middleware)

		r.Get("/", handler.ListConfigs)
		r.Post("/", handler.AddConfig)
	})

	r.Route("/device", func(r chi.Router) {
		r.Use(auth.Middleware)

		r.Get("/", handler.ListDevices)
		r.Post("/", handler.AddDevice)
	})

	r.Route("/logs", func(r chi.Router) {
		r.Use(auth.Middleware)

		r.Get("/", handler.ListLogs)
	})
	return r
}
