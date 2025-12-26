-- Initialize compliance database with required extensions and configurations

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create indexes for better performance
-- These will be created after Prisma migration, but good to have as reference

-- User indexes
-- CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
-- CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
-- CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
-- CREATE INDEX IF NOT EXISTS idx_users_kyc_status ON users(kyc_status);

-- Transaction indexes for AML monitoring
-- CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
-- CREATE INDEX IF NOT EXISTS idx_transactions_amount ON transactions(amount);
-- CREATE INDEX IF NOT EXISTS idx_transactions_time ON transactions(transaction_time);
-- CREATE INDEX IF NOT EXISTS idx_transactions_aml_status ON transactions(aml_status);

-- AML Alert indexes
-- CREATE INDEX IF NOT EXISTS idx_aml_alerts_user_id ON aml_alerts(user_id);
-- CREATE INDEX IF NOT EXISTS idx_aml_alerts_severity ON aml_alerts(severity);
-- CREATE INDEX IF NOT EXISTS idx_aml_alerts_status ON aml_alerts(status);
-- CREATE INDEX IF NOT EXISTS idx_aml_alerts_created_at ON aml_alerts(created_at);

-- Audit log indexes
-- CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
-- CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id);
-- CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Document indexes
-- CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
-- CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);
-- CREATE INDEX IF NOT EXISTS idx_documents_hash ON documents(file_hash);

-- Set up database configuration for compliance
ALTER DATABASE compliance_db SET timezone TO 'UTC';

-- Create a function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Note: Triggers will be set up after Prisma migration