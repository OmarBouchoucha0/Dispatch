package main

import (
	"context"
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
	dbURL := "postgres://omar:omar2001@localhost:5432/dispatch"
	if err := db.Connect(ctx, dbURL); err != nil {
		slog.Error("Database failed", "error", err)
	}
	defer db.Pool.Close()
	h := mount()
	if err := run(h, "127.0.0.1:8080"); err != nil {
		slog.Error("Server has failed to start", "error", err)
		os.Exit(1)
	}
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

		r.Group(func(r chi.Router) {
			r.Use(auth.Middleware)
			r.Get("/me", handler.Me)
			r.Get("/", handler.ListUsers)
			r.Post("/", handler.AddUser)
			r.Get("/logout", handler.Logout)
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
