-- Migration: Create Chat Messages Table
-- Description: AI chat history and conversations
-- Date: 2026-01-26

CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chat_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_user ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_created ON chat_messages(created_at);

-- Create partial index for user sessions
CREATE INDEX IF NOT EXISTS idx_chat_user_session ON chat_messages(user_id, session_id)
WHERE user_id IS NOT NULL;

-- Add comments
COMMENT ON TABLE chat_messages IS 'AI chat messages and history';
COMMENT ON COLUMN chat_messages.role IS 'Message role: user or assistant';
COMMENT ON COLUMN chat_messages.session_id IS 'Session identifier for conversation grouping';
COMMENT ON COLUMN chat_messages.metadata IS 'Additional metadata as JSON (tokens, model, etc)';
