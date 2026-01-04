-- Add is_published column to notes table
ALTER TABLE notes 
ADD COLUMN is_published BOOLEAN DEFAULT FALSE;

-- Add index for faster queries on published posts
CREATE INDEX idx_notes_is_published ON notes(is_published);
