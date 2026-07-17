ALTER TABLE configs DROP CONSTRAINT IF EXISTS configs_device_id_key;

ALTER TABLE logs DROP CONSTRAINT IF EXISTS logs_action_check;
ALTER TABLE logs ADD CONSTRAINT logs_action_check CHECK (Action IN ('Created', 'Updated', 'Renamed', 'Deleted'));
