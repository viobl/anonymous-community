-- Updated database schema for anonymous community
-- This replaces the existing threads-schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS threads CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nickname VARCHAR(50) UNIQUE NOT NULL,
  anonymous_name VARCHAR(50) NOT NULL, -- System-generated anonymous name
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create updated threads table
CREATE TABLE threads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  parent_id UUID REFERENCES threads(id) ON DELETE CASCADE, -- NULL for root posts
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- Changed from anonymous_id
  visibility_type VARCHAR(20) DEFAULT 'anonymous' CHECK (visibility_type IN ('anonymous', 'nickname')),
  depth INTEGER DEFAULT 0, -- 0 for root posts, 1+ for replies
  path TEXT[], -- hierarchical path for efficient querying
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0 -- cached count of direct replies
);

-- Create indexes for performance
CREATE INDEX idx_threads_parent_id ON threads(parent_id);
CREATE INDEX idx_threads_user_id ON threads(user_id);
CREATE INDEX idx_threads_created_at ON threads(created_at DESC);
CREATE INDEX idx_threads_path ON threads USING GIN(path);
CREATE INDEX idx_threads_visibility ON threads(visibility_type);
CREATE INDEX idx_user_profiles_nickname ON user_profiles(nickname);

-- Enable Row Level Security
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for threads
CREATE POLICY "Enable read access for all users" ON threads 
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON threads 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

CREATE POLICY "Enable update for post owners only" ON threads 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for post owners only" ON threads 
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_profiles
CREATE POLICY "Enable read access for all users" ON user_profiles 
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for own profile only" ON user_profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for own profile only" ON user_profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Function to generate random anonymous names
CREATE OR REPLACE FUNCTION generate_anonymous_name()
RETURNS TEXT AS $$
DECLARE
  adjectives TEXT[] := ARRAY[
    '행복한', '슬픈', '빠른', '느린', '큰', '작은', '붉은', '파란', '하얀', '검은',
    '밝은', '어두운', '따뜻한', '차가운', '조용한', '시끄러운', '친절한', '귀여운'
  ];
  nouns TEXT[] := ARRAY[
    '고양이', '강아지', '토끼', '새', '물고기', '곰', '여우', '늑대', '사자', '호랑이',
    '코끼리', '기린', '판다', '펭귄', '돌고래', '나비', '꿀벌', '다람쁐'
  ];
  adj TEXT;
  noun TEXT;
BEGIN
  adj := adjectives[floor(random() * array_length(adjectives, 1) + 1)];
  noun := nouns[floor(random() * array_length(nouns, 1) + 1)];
  RETURN adj || ' ' || noun;
END;
$$ LANGUAGE plpgsql;

-- Function to update thread hierarchy
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

-- Function to create user profile automatically
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
DECLARE
  random_nickname TEXT;
  random_anonymous TEXT;
  counter INTEGER := 1;
BEGIN
  -- Generate unique nickname
  LOOP
    random_nickname := 'user_' || substr(NEW.id::text, 1, 8);
    IF counter > 1 THEN
      random_nickname := random_nickname || '_' || counter;
    END IF;
    
    -- Check if nickname already exists
    IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE nickname = random_nickname) THEN
      EXIT;
    END IF;
    
    counter := counter + 1;
  END LOOP;
  
  -- Generate unique anonymous name
  LOOP
    random_anonymous := generate_anonymous_name();
    
    -- Check if anonymous name already exists (optional uniqueness)
    IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE anonymous_name = random_anonymous) THEN
      EXIT;
    END IF;
  END LOOP;
  
  -- Insert user profile
  INSERT INTO user_profiles (id, nickname, anonymous_name)
  VALUES (NEW.id, random_nickname, random_anonymous);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER thread_hierarchy_trigger
  BEFORE INSERT ON threads
  FOR EACH ROW
  EXECUTE FUNCTION update_thread_hierarchy();

CREATE TRIGGER create_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();