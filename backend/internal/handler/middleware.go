package handler

import (
	"context"
	"net/http"
	"time"
)

type ctxKey string

const timezoneKey ctxKey = "timezone"

func TimezoneMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tz := r.Header.Get("X-Timezone")
		if tz != "" {
			loc, err := time.LoadLocation(tz)
			if err == nil {
				r = r.WithContext(context.WithValue(r.Context(), timezoneKey, loc))
			}
		}
		next.ServeHTTP(w, r)
	})
}

func getLocation(r *http.Request) *time.Location {
	if loc, ok := r.Context().Value(timezoneKey).(*time.Location); ok {
		return loc
	}
	return time.UTC
}
