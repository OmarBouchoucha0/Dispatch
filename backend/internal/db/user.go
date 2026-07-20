package db

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
)

type User struct {
	ID           string
	FirstName    string
	LastName     string
	Email        string
	PasswordHash string
	Role         string
	CreatedAt    string
}

func GetUserByID(ctx context.Context, userID string) (*User, error) {
	var user User

	err := Pool.QueryRow(
		ctx,
		`
        SELECT id, first_name, last_name, email, password_hash, role
        FROM users
        WHERE id = $1
        `,
		userID,
	).Scan(
		&user.ID,
		&user.FirstName,
		&user.LastName,
		&user.Email,
		&user.PasswordHash,
		&user.Role,
	)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

var ErrUserNotFound = errors.New("user not found")

func GetUserByEmail(ctx context.Context, email string) (*User, error) {
	var user User

	err := Pool.QueryRow(
		ctx,
		`
        SELECT id, first_name, last_name, email, password_hash, role, created_at
        FROM users
        WHERE email = $1
        `,
		email,
	).Scan(
		&user.ID,
		&user.FirstName,
		&user.LastName,
		&user.Email,
		&user.PasswordHash,
		&user.Role,
		&user.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrUserNotFound
		}

		return nil, err
	}

	return &user, nil
}

func GetUsers(ctx context.Context) ([]User, error) {
	rows, err := Pool.Query(
		ctx,
		`
        SELECT id, first_name, last_name, email, created_at
        FROM users
        `,
	)
	if err != nil {
		return nil, err
	}
	var users []User
	for rows.Next() {
		var user User
		err := rows.Scan(
			&user.ID,
			&user.FirstName,
			&user.LastName,
			&user.Email,
			&user.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}
	return users, nil
}

func AddUser(ctx context.Context, user *User) error {
	err := Pool.QueryRow(
		ctx,
		`
		INSERT INTO users (
			first_name,
			last_name,
			email,
			password_hash,
			role
		)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
		`,
		user.FirstName,
		user.LastName,
		user.Email,
		user.PasswordHash,
		user.Role,
	).Scan(&user.ID)
	if err != nil {
		return err
	}
	return nil
}
