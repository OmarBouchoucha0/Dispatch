ALTER TABLE configs ADD CONSTRAINT configs_device_id_key UNIQUE (device_id);

ALTER TABLE logs DROP CONSTRAINT IF EXISTS logs_action_check;
ALTER TABLE logs ADD CONSTRAINT logs_action_check CHECK (Action IN ('Created', 'Updated', 'Deleted'));
