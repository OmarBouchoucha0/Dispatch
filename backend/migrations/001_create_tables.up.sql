CREATE EXTENSION IF NOT EXISTS "pgcrypto";


CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user'
        CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);


CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);


CREATE TABLE configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    device_id UUID NOT NULL,
    content JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_config_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_config_device
        FOREIGN KEY (device_id)
        REFERENCES devices(id)
        ON DELETE CASCADE
);


CREATE TABLE logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    device_id UUID NOT NULL,
    Action VARCHAR(50) NOT NULL DEFAULT 'Created'
        CHECK (Action IN ('Created', 'Updated','Renamed','Deleted')),

    Created_At TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_log_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- Indexes
CREATE INDEX idx_configs_user_id
ON configs(user_id);

CREATE INDEX idx_logs_created_at
ON logs(user_id, Created_at DESC);
