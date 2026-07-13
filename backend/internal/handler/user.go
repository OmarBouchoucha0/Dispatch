package handler

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/OmarBouchoucha0/Dispatch/backend/internal/db"
	"golang.org/x/crypto/bcrypt"
)

func hashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword(
		[]byte(password),
		bcrypt.DefaultCost,
	)

	return string(hash), err
}

func checkPassword(password string, hash string) bool {
	err := bcrypt.CompareHashAndPassword(
		[]byte(hash),
		[]byte(password),
	)

	return err == nil
}

func ListUsers(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	configs, err := db.GetUsers(ctx)
	if err != nil {
		slog.Error("coudnt get users", "error", err)
		http.Error(w, http.StatusText(422), 422)
		return
	}
	w.Header().Set("Content-Type", "application/json")

	err = json.NewEncoder(w).Encode(configs)
	if err != nil {
		slog.Error("json encoding", "error", err)
		http.Error(
			w,
			http.StatusText(http.StatusInternalServerError),
			http.StatusInternalServerError,
		)
		return
	}
	slog.Info("config Listed", "configs", configs)
}

type CreateUserRequest struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
	Password  string `json:"password"`
}

func AddUser(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var req CreateUserRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		slog.Error("json decoding", "error", err)
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}
	pHash, err := hashPassword(req.Password)
	if err != nil {
		slog.Error("password hashing", "error", err)
		http.Error(
			w,
			http.StatusText(http.StatusInternalServerError),
			http.StatusInternalServerError,
		)
		return
	}
	user := db.User{
		"1",
		req.FirstName,
		req.LastName,
		req.Email,
		pHash,
	}
	err = db.AddUser(ctx, user)
	if err != nil {
		slog.Error("coudnt add config", "error", err)
		http.Error(w, http.StatusText(422), 422)
		return
	}
	slog.Info("config added")
}
