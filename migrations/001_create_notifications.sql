-- Migration: Create notifications table and indexes
-- Run this in your Supabase SQL Editor

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('success', 'info', 'warning', 'error')),
    read BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    node_pubkey TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_timestamp ON notifications(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_node_pubkey ON notifications(node_pubkey);

-- Enable RLS (Row Level Security)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create a permissive policy for now (adjust based on your auth requirements)
DROP POLICY IF EXISTS "Allow all for notifications" ON notifications;
CREATE POLICY "Allow all for notifications" ON notifications FOR ALL USING (true);

-- Add unique constraint on node_pubkey to allow upsert to work
-- (prevents duplicate notifications for the same node)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'notifications_node_pubkey_unique'
    ) THEN
        ALTER TABLE notifications ADD CONSTRAINT notifications_node_pubkey_unique UNIQUE (node_pubkey);
    END IF;
EXCEPTION WHEN duplicate_object THEN
    -- Constraint already exists, ignore
    NULL;
END $$;

-- Ensure pnodes table has the correct structure for latency
-- (This should already exist, but let's make sure metrics column can store responseTimeMs)
-- The metrics column is JSONB so it should already support any structure

-- Create index on pnodes for faster performance score lookups
CREATE INDEX IF NOT EXISTS idx_pnodes_credits ON pnodes(credits DESC);
CREATE INDEX IF NOT EXISTS idx_pnodes_status ON pnodes(status);
CREATE INDEX IF NOT EXISTS idx_pnodes_updated ON pnodes(updated_at DESC);

-- Ensure network_stats has proper indexes
CREATE INDEX IF NOT EXISTS idx_network_stats_updated ON network_stats(updated_at DESC);

-- Clean up old network stats (keep last 24 hours for history charts)
-- Run this periodically or set up a cron job
-- DELETE FROM network_stats WHERE updated_at < NOW() - INTERVAL '7 days';

COMMENT ON TABLE notifications IS 'Real-time notifications generated during pNode data ingestion';
COMMENT ON COLUMN notifications.node_pubkey IS 'Public key of the node this notification relates to (if applicable)';
COMMENT ON COLUMN notifications.type IS 'Notification severity: success, info, warning, or error';
