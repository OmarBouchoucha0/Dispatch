ALTER TABLE configs DROP CONSTRAINT IF EXISTS configs_device_id_name_key;
ALTER TABLE configs DROP COLUMN IF EXISTS name;
