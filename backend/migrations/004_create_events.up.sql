CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    configs_before JSONB,
    configs_after JSONB NOT NULL,
    scheduled_at TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'deployed', 'cancelled')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,
    deployed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_events_status
ON events(status);

CREATE INDEX IF NOT EXISTS idx_events_scheduled_at
ON events(scheduled_at);
