-- New unified threads table schema
-- This replaces both posts and comments tables

-- Drop existing tables if they exist
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS posts CASCADE;

-- Create unified threads table
CREATE TABLE threads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  parent_id UUID REFERENCES threads(id) ON DELETE CASCADE, -- NULL for root posts
  content TEXT NOT NULL,
  anonymous_id TEXT NOT NULL,
  depth INTEGER DEFAULT 0, -- 0 for root posts, 1+ for replies
  path TEXT[], -- hierarchical path like [root_id, parent_id, ...] for efficient querying
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0 -- cached count of direct replies
);

-- Create indexes for performance
CREATE INDEX idx_threads_parent_id ON threads(parent_id);
CREATE INDEX idx_threads_created_at ON threads(created_at DESC);
CREATE INDEX idx_threads_path ON threads USING GIN(path); -- for hierarchical queries
CREATE INDEX idx_threads_anonymous_id ON threads(anonymous_id);

-- Enable Row Level Security
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for anonymous access)
CREATE POLICY "Enable read access for all users" ON threads FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON threads FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON threads FOR UPDATE USING (true);

-- Function to update path and depth automatically
CREATE OR REPLACE FUNCTION update_thread_hierarchy()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_id IS NULL THEN
    -- Root thread
    NEW.depth = 0;
    NEW.path = ARRAY[NEW.id::text];
  ELSE
    -- Reply thread
    SELECT depth + 1, path || NEW.id::text
    INTO NEW.depth, NEW.path
    FROM threads
    WHERE id = NEW.parent_id;
    
    -- Update parent's reply count
    UPDATE threads 
    SET reply_count = reply_count + 1 
    WHERE id = NEW.parent_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set hierarchy
CREATE TRIGGER thread_hierarchy_trigger
  BEFORE INSERT ON threads
  FOR EACH ROW
  EXECUTE FUNCTION update_thread_hierarchy();