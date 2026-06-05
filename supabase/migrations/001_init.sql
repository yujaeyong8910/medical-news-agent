-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  source VARCHAR(100) NOT NULL,
  source_url VARCHAR(500),
  title TEXT NOT NULL,
  url TEXT UNIQUE NOT NULL,
  original_content TEXT,
  summary TEXT,
  tags TEXT[],
  disease_keywords TEXT[],
  severity VARCHAR(20) DEFAULT 'medium',
  published_at TIMESTAMPTZ,
  collected_at TIMESTAMPTZ DEFAULT NOW(),
  language VARCHAR(10) DEFAULT 'en'
);

-- Indexes for fast filtering and sorting
CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_articles_collected_at ON articles(collected_at DESC);

-- Row Level Security
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "public_read" ON articles FOR SELECT USING (true);

-- Service role full access (bypasses RLS automatically)
