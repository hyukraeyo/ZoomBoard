-- Add user_id column to notes table for ownership tracking
ALTER TABLE notes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create index for faster queries by user
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
