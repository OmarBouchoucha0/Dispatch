package handler

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"os"

	"github.com/OmarBouchoucha0/Dispatch/backend/internal/auth"
	"github.com/OmarBouchoucha0/Dispatch/backend/internal/db"
	"golang.org/x/crypto/bcrypt"
)

var (
	cookieSameSite http.SameSite
	cookieSecure   bool
)

func init() {
	if os.Getenv("DEV") == "true" {
		cookieSameSite = http.SameSiteLaxMode
		cookieSecure = false
	} else {
		cookieSameSite = http.SameSiteNoneMode
		cookieSecure = true
	}
}

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

type ListUsersRequest struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
	CreatedAt string `json:"created_at"`
}

func ListUsers(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	users, err := db.GetUsers(ctx)
	if err != nil {
		slog.Error("coudnt get users", "error", err)
		http.Error(w, http.StatusText(http.StatusUnprocessableEntity), http.StatusUnprocessableEntity)
		return
	}
	w.Header().Set("Content-Type", "application/json")

	var req []ListUsersRequest

	for _, user := range users {
		req = append(req, ListUsersRequest{FirstName: user.FirstName, LastName: user.LastName, Email: user.Email, CreatedAt: user.CreatedAt})
	}

	err = json.NewEncoder(w).Encode(req)
	if err != nil {
		slog.Error("json encoding", "error", err)
		http.Error(
			w,
			http.StatusText(http.StatusInternalServerError),
			http.StatusInternalServerError,
		)
		return
	}
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
	user := &db.User{
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		Email:        req.Email,
		PasswordHash: pHash,
		Role:         "user",
	}
	err = db.AddUser(ctx, user)
	if err != nil {
		slog.Error("coudnt add user", "error", err)
		http.Error(w, err.Error(), http.StatusUnprocessableEntity)
		return
	}
	slog.Info("user added")
	w.WriteHeader(http.StatusCreated)
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func Login(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var req LoginRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		slog.Error("json decoding", "error", err)
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}
	user, err := db.GetUserByEmail(ctx, req.Email)
	if err != nil {
		slog.Error("email not found", "error", err)
		http.Error(w, "invalid email or password", http.StatusUnauthorized)
		return
	}
	if !checkPassword(req.Password, user.PasswordHash) {
		slog.Error("password not found")
		http.Error(w, "invalid email or password", http.StatusUnauthorized)
		return
	}
	token, err := auth.CreateToken(user.ID, user.Role)
	if err != nil {
		slog.Error("token creation", "error", err)
		http.Error(
			w,
			"token creation",
			http.StatusInternalServerError,
		)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "login_token",
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   cookieSecure,
		SameSite: cookieSameSite,
		MaxAge:   86400,
	})

	w.WriteHeader(http.StatusOK)
	slog.Info("login succesful")
}

func Signup(w http.ResponseWriter, r *http.Request) {
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
	user := &db.User{
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		Email:        req.Email,
		PasswordHash: pHash,
		Role:         "user",
	}
	_, err = db.GetUserByEmail(ctx, user.Email)
	if err == nil {
		http.Error(w, "email already used", http.StatusUnauthorized)
		return
	}
	if !errors.Is(err, db.ErrUserNotFound) {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}
	err = db.AddUser(ctx, user)
	if err != nil {
		slog.Error("coudnt add user", "error", err)
		http.Error(w, err.Error(), http.StatusUnprocessableEntity)
		return
	}
	token, err := auth.CreateToken(user.ID, user.Role)
	if err != nil {
		slog.Error("token creation", "error", err)
		http.Error(
			w,
			"token creation",
			http.StatusInternalServerError,
		)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "login_token",
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   cookieSecure,
		SameSite: cookieSameSite,
		MaxAge:   86400,
	})
	slog.Info("user added")
	w.WriteHeader(http.StatusCreated)
}

func Logout(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     "login_token",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   cookieSecure,
		SameSite: cookieSameSite,
		MaxAge:   -1,
	})
	w.WriteHeader(http.StatusOK)
}

func Me(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	claims, ok := ctx.Value(auth.UserKey).(*auth.Claims)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	user, err := db.GetUserByID(ctx, claims.UserID)
	if err != nil {
		slog.Error("get user", "error", err)
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	response := struct {
		ID        string `json:"id"`
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Email     string `json:"email"`
		Role      string `json:"role"`
	}{
		ID:        user.ID,
		FirstName: user.FirstName,
		LastName:  user.LastName,
		Email:     user.Email,
		Role:      user.Role,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	json.NewEncoder(w).Encode(response)
}
