package db

import "context"

type User struct {
	ID           string
	FirstName    string
	LastName     string
	Email        string
	PasswordHash string
}

func GetUserByUserID(ctx context.Context, userID string) (*User, error) {
	var user User

	err := Pool.QueryRow(
		ctx,
		`
        SELECT id, first_name, last_name, email
        FROM users
        WHERE user_id = $1
        `,
		userID,
	).Scan(
		&user.ID,
		&user.FirstName,
		&user.LastName,
		&user.Email,
	)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func GetUsers(ctx context.Context) ([]User, error) {
	rows, err := Pool.Query(
		ctx,
		`
        SELECT id, first_name, last_name, email
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

func AddUser(ctx context.Context, user User) error {
	_, err := Pool.Exec(
		ctx,
		`
		INSERT INTO users (
			first_name,
			last_name,
			email,
			password_hash
		)
		VALUES ($1, $2, $3, $4)
		`,
		user.FirstName,
		user.LastName,
		user.Email,
		user.PasswordHash,
	)
	if err != nil {
		return err
	}
	return nil
}
