-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create accounts table for OAuth providers (NextAuth.js)
CREATE TABLE IF NOT EXISTS accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    provider_account_id VARCHAR(255) NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at BIGINT,
    token_type VARCHAR(255),
    scope VARCHAR(255),
    id_token TEXT,
    session_state VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(provider, provider_account_id)
);

-- Create sessions table for NextAuth.js
CREATE TABLE IF NOT EXISTS sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create verification_tokens table for NextAuth.js
CREATE TABLE IF NOT EXISTS verification_tokens (
    identifier VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (identifier, token)
);

-- Create facebook_messages table for storing Facebook/Instagram messages
CREATE TABLE IF NOT EXISTS facebook_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id VARCHAR(255) UNIQUE NOT NULL,
    conversation_id VARCHAR(255) NOT NULL,
    sender_id VARCHAR(255) NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    receipt_id VARCHAR(255),
    message_text TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('facebook', 'instagram')),
    is_replied BOOLEAN DEFAULT FALSE,
    replied_by VARCHAR(20) CHECK (replied_by IN ('AI', 'human')),
    reply_message_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create facebook_conversations table for conversation metadata
CREATE TABLE IF NOT EXISTS facebook_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id VARCHAR(255) UNIQUE NOT NULL,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('facebook', 'instagram')),
    participants JSONB DEFAULT '[]'::jsonb,
    last_message_at TIMESTAMP WITH TIME ZONE,
    unread_count INTEGER DEFAULT 0,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create facebook_sync_log table for tracking sync operations
CREATE TABLE IF NOT EXISTS facebook_sync_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sync_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
    messages_processed INTEGER DEFAULT 0,
    conversations_processed INTEGER DEFAULT 0,
    error_message TEXT,
    sync_duration_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a simple instagram_messages table
CREATE TABLE instagram_messages (
    message_id VARCHAR PRIMARY KEY,
    conversation_id VARCHAR NOT NULL,
    sender_id VARCHAR NOT NULL,
    sender_name VARCHAR NOT NULL,
    receipt_id VARCHAR,
    message_text TEXT,
    attachments JSONB DEFAULT '[]',
    timestamp TIMESTAMPTZ NOT NULL,
    platform VARCHAR DEFAULT 'instagram',
    is_replied BOOLEAN DEFAULT false,
    replied_by VARCHAR, -- 'AI' or 'human'
    reply_message_id VARCHAR,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create appointments table for dental appointments
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    gender TEXT NOT NULL,
    location TEXT NOT NULL,
    service TEXT NOT NULL,
    preferred_time TEXT, -- optional: e.g., 'Morning', 'Evening', 'Weekend'
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_token ON sessions(session_token);

-- Facebook messages indexes
CREATE INDEX IF NOT EXISTS idx_facebook_messages_message_id ON facebook_messages(message_id);
CREATE INDEX IF NOT EXISTS idx_facebook_messages_conversation_id ON facebook_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_facebook_messages_timestamp ON facebook_messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_facebook_messages_platform ON facebook_messages(platform);
CREATE INDEX IF NOT EXISTS idx_facebook_messages_is_replied ON facebook_messages(is_replied);
CREATE INDEX IF NOT EXISTS idx_facebook_messages_sender_id ON facebook_messages(sender_id);

-- Facebook conversations indexes
CREATE INDEX IF NOT EXISTS idx_facebook_conversations_conversation_id ON facebook_conversations(conversation_id);
CREATE INDEX IF NOT EXISTS idx_facebook_conversations_platform ON facebook_conversations(platform);
CREATE INDEX IF NOT EXISTS idx_facebook_conversations_last_message_at ON facebook_conversations(last_message_at DESC);

-- Facebook sync log indexes
CREATE INDEX IF NOT EXISTS idx_facebook_sync_log_created_at ON facebook_sync_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_facebook_sync_log_status ON facebook_sync_log(status);

-- Instagram messages indexes
CREATE INDEX IF NOT EXISTS idx_instagram_messages_message_id ON instagram_messages(message_id);
CREATE INDEX IF NOT EXISTS idx_instagram_messages_conversation_id ON instagram_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_instagram_messages_timestamp ON instagram_messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_instagram_messages_platform ON instagram_messages(platform);
CREATE INDEX IF NOT EXISTS idx_instagram_messages_is_replied ON instagram_messages(is_replied);
CREATE INDEX IF NOT EXISTS idx_instagram_messages_sender_id ON instagram_messages(sender_id);

-- Appointments indexes
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_created_at ON appointments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_service ON appointments(service);
CREATE INDEX IF NOT EXISTS idx_appointments_full_name ON appointments(full_name);

-- Disable RLS for all tables to keep it simple
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE verification_tokens DISABLE ROW LEVEL SECURITY;
ALTER TABLE facebook_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE facebook_conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE facebook_sync_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to service role
GRANT ALL ON users TO service_role;
GRANT ALL ON accounts TO service_role;
GRANT ALL ON sessions TO service_role;
GRANT ALL ON verification_tokens TO service_role;
GRANT ALL ON facebook_messages TO service_role;
GRANT ALL ON facebook_conversations TO service_role;
GRANT ALL ON facebook_sync_log TO service_role;
GRANT ALL ON instagram_messages TO service_role;
GRANT ALL ON appointments TO service_role;

-- Grant permissions to authenticated role
GRANT SELECT, INSERT, UPDATE ON facebook_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE ON facebook_conversations TO authenticated;
GRANT SELECT, INSERT ON facebook_sync_log TO authenticated;
GRANT SELECT, INSERT, UPDATE ON instagram_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON appointments TO authenticated;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facebook_messages_updated_at BEFORE UPDATE ON facebook_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facebook_conversations_updated_at BEFORE UPDATE ON facebook_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically update conversation metadata when messages are inserted
CREATE OR REPLACE FUNCTION update_conversation_on_message_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Update or insert conversation metadata
    INSERT INTO facebook_conversations (conversation_id, platform, last_message_at, participants)
    VALUES (
        NEW.conversation_id, 
        NEW.platform, 
        NEW.timestamp,
        JSONB_BUILD_ARRAY(JSONB_BUILD_OBJECT('id', NEW.sender_id, 'name', NEW.sender_name))
    )
    ON CONFLICT (conversation_id) 
    DO UPDATE SET 
        last_message_at = NEW.timestamp,
        participants = CASE 
            WHEN NOT facebook_conversations.participants @> JSONB_BUILD_ARRAY(JSONB_BUILD_OBJECT('id', NEW.sender_id, 'name', NEW.sender_name))
            THEN facebook_conversations.participants || JSONB_BUILD_ARRAY(JSONB_BUILD_OBJECT('id', NEW.sender_id, 'name', NEW.sender_name))
            ELSE facebook_conversations.participants
        END,
        updated_at = NOW();

    -- Update unread count if message is not replied
    IF NOT NEW.is_replied THEN
        UPDATE facebook_conversations 
        SET unread_count = unread_count + 1, updated_at = NOW()
        WHERE conversation_id = NEW.conversation_id;
    END IF;

    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for conversation updates
CREATE TRIGGER trigger_update_conversation_on_message_insert
    AFTER INSERT ON facebook_messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_on_message_insert();

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid primary key default gen_random_uuid(),
  from_email text not null,
  task_name text not null,
  task_purpose text not null,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  due_date date,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Insert sample tasks data
INSERT INTO tasks (from_email, task_name, task_purpose, status) VALUES
('patient@example.com', 'Appointment Follow-up', 'Call patient to confirm their dental cleaning appointment scheduled for next week', 'pending'),
('doctor@clinic.com', 'Equipment Maintenance', 'Schedule routine maintenance for dental chairs and sterilization equipment', 'pending'),
('admin@clinic.com', 'Insurance Verification', 'Verify insurance coverage for upcoming patient appointments', 'completed'),
('receptionist@clinic.com', 'Patient Reminder Calls', 'Contact patients to remind them about their upcoming appointments', 'pending'),
('manager@clinic.com', 'Staff Training Session', 'Organize training session on new dental procedures and safety protocols', 'completed'),
('assistant@clinic.com', 'Inventory Check', 'Review and update dental supplies inventory for next month ordering', 'pending'),
('finance@clinic.com', 'Billing Review', 'Review and process pending insurance claims and patient billing', 'pending'),
('hygienist@clinic.com', 'Patient Education Materials', 'Update and organize patient education brochures and digital content', 'completed');

-- Enable realtime subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE facebook_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE instagram_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks; 