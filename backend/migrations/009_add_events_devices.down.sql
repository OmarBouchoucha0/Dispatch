ALTER TABLE events
  DROP COLUMN IF EXISTS devices_before,
  DROP COLUMN IF EXISTS devices_after;
