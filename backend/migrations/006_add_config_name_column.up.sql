ALTER TABLE configs ADD COLUMN name VARCHAR(255) NOT NULL DEFAULT '';
ALTER TABLE configs ADD CONSTRAINT configs_device_id_name_key UNIQUE (device_id, name);
