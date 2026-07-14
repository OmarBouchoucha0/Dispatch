package auth

import (
	"context"
	"net/http"
)

type contextKey string

const UserKey contextKey = "user"

func Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("login_token")
		if err != nil {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		claims, err := ParseToken(cookie.Value)
		if err != nil {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(
			r.Context(),
			UserKey,
			claims,
		)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
