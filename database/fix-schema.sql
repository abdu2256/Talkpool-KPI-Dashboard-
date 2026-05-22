-- QUICK FIX for: column "record_hour" does not exist
-- Run this in pgAdmin (connected to talkpool_kpi database)

-- Removes old wrong table and recreates correct structure
DROP TABLE IF EXISTS kpi_records CASCADE;

CREATE TABLE kpi_records (
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

CREATE INDEX idx_kpi_date ON kpi_records (record_date);
CREATE INDEX idx_kpi_cluster ON kpi_records (cluster);
CREATE INDEX idx_kpi_hour ON kpi_records (record_hour);
CREATE INDEX idx_kpi_date_cluster ON kpi_records (record_date, cluster);
