-- Talkpool Telecom KPI Dashboard - PostgreSQL Schema
-- IMPORTANT: If you get "record_hour does not exist", your old table has wrong columns.
-- Fix: run database/fix-schema.sql first (drops old table), then run this file.

-- Step 1: Create database (run once as postgres user)
-- CREATE DATABASE talkpool_kpi;

-- Step 2: Connect to talkpool_kpi database, then run below

-- Drop old incompatible table (only if you have no data to keep)
-- DROP TABLE IF EXISTS kpi_records CASCADE;

CREATE TABLE IF NOT EXISTS kpi_records (
    id SERIAL PRIMARY KEY,
    record_date DATE NOT NULL,
    record_hour INTEGER NOT NULL CHECK (record_hour >= 0 AND record_hour <= 23),
    cluster VARCHAR(100) NOT NULL,
    rrc_setup_success_rate DECIMAL(10, 4),
    erab_setup_success_rate DECIMAL(10, 4),
    drop_rate DECIMAL(10, 4),
    per_user_throughput_dl DECIMAL(12, 4),
    per_user_throughput_ul DECIMAL(12, 4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (record_date, record_hour, cluster)
);

-- Indexes (run AFTER table has correct columns)
CREATE INDEX IF NOT EXISTS idx_kpi_date ON kpi_records (record_date);
CREATE INDEX IF NOT EXISTS idx_kpi_cluster ON kpi_records (cluster);
CREATE INDEX IF NOT EXISTS idx_kpi_hour ON kpi_records (record_hour);
CREATE INDEX IF NOT EXISTS idx_kpi_date_cluster ON kpi_records (record_date, cluster);

CREATE TABLE IF NOT EXISTS app_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO app_settings (setting_key, setting_value)
VALUES
    ('company_name', 'Talkpool'),
    ('default_cluster', 'All'),
    ('chart_theme', 'blue'),
    ('date_format', 'YYYY-MM-DD')
ON CONFLICT (setting_key) DO NOTHING;
