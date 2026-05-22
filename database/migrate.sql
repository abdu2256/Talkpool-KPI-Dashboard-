-- Fix old kpi_records table (column names mismatch)
-- Run in pgAdmin or psql connected to talkpool_kpi database

-- OPTION 1: Fresh start (deletes all KPI data) — recommended if no important data
DROP TABLE IF EXISTS kpi_records CASCADE;

-- Then run full schema from database/schema.sql OR restart backend (auto-creates table)

-- ---------------------------------------------------------------------------
-- OPTION 2: Migrate old columns (keep existing data)
-- Uncomment below if your old table used "hour" and "date" instead of record_*

/*
DO $$
BEGIN
  -- Rename hour -> record_hour
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'kpi_records' AND column_name = 'hour'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'kpi_records' AND column_name = 'record_hour'
  ) THEN
    ALTER TABLE kpi_records RENAME COLUMN hour TO record_hour;
  END IF;

  -- Rename date -> record_date
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'kpi_records' AND column_name = 'date'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'kpi_records' AND column_name = 'record_date'
  ) THEN
    ALTER TABLE kpi_records RENAME COLUMN date TO record_date;
  END IF;

  -- Add record_hour if missing entirely
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'kpi_records' AND column_name = 'record_hour'
  ) THEN
    ALTER TABLE kpi_records ADD COLUMN record_hour INTEGER DEFAULT 0;
    UPDATE kpi_records SET record_hour = 0 WHERE record_hour IS NULL;
    ALTER TABLE kpi_records ALTER COLUMN record_hour SET NOT NULL;
  END IF;

  -- Add record_date if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'kpi_records' AND column_name = 'record_date'
  ) THEN
    ALTER TABLE kpi_records ADD COLUMN record_date DATE;
  END IF;
END $$;

-- Recreate indexes after migration
CREATE INDEX IF NOT EXISTS idx_kpi_date ON kpi_records (record_date);
CREATE INDEX IF NOT EXISTS idx_kpi_cluster ON kpi_records (cluster);
CREATE INDEX IF NOT EXISTS idx_kpi_hour ON kpi_records (record_hour);
CREATE INDEX IF NOT EXISTS idx_kpi_date_cluster ON kpi_records (record_date, cluster);
*/
