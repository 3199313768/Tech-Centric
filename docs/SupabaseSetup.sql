-- 1. 创建核心碎片记录表
CREATE TABLE kb_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  type VARCHAR(20) CHECK (type IN ('text', 'code', 'image', 'file')) NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 核心优化：创建倒排索引以支撑极速查询
CREATE INDEX idx_kb_tags ON kb_records USING GIN (tags);

-- 基于 content 字段建立全文检索索引。若大量涉及中文，需视情况在 Supabase 中使用 pg_trgm
CREATE INDEX idx_kb_content_search ON kb_records 
USING GIN (to_tsvector('simple', content));

-- 3. 安全策略 (RLS)：确保真正的“单人私密”
ALTER TABLE kb_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only owner can manage records" ON kb_records
    FOR ALL USING (auth.uid() = user_id);
