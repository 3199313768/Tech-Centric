import * as fs from 'fs';
import path from 'path';

// Import the data directly using relative path since this is a script
import { getInitialResources } from '../src/data/initialResources';

const resources = getInitialResources();

const sql = `
-- 1. 创建 resources 表
CREATE TABLE IF NOT EXISTS public.resources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  tags TEXT[],
  created_at BIGINT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  click_count INTEGER DEFAULT 0
);

-- 2. 设置 RLS 策略
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "允许匿名用户读取 resources" ON public.resources FOR SELECT USING (true);
CREATE POLICY "允许匿名用户修改 resources" ON public.resources FOR ALL USING (true) WITH CHECK (true);

-- 3. 初始数据导入
INSERT INTO public.resources (id, name, url, description, category, tags, created_at, is_pinned, click_count) VALUES
${resources.map(r => `('${r.id}', '${r.name.replace(/'/g, "''")}', '${r.url.replace(/'/g, "''")}', ${r.description ? `'${r.description.replace(/'/g, "''")}'` : 'NULL'}, '${r.category.replace(/'/g, "''")}', ${r.tags ? `ARRAY[${r.tags.map(t => `'${t.replace(/'/g, "''")}'`).join(', ')}]` : 'NULL'}, ${r.createdAt}, ${r.isPinned ? 'true' : 'false'}, ${r.clickCount || 0})`).join(',\n')}
ON CONFLICT (id) DO NOTHING;
`;

const outputPath = path.resolve(__dirname, 'setup-resources.sql');
fs.writeFileSync(outputPath, sql.trim());
console.log('SQL generated at scripts/setup-resources.sql');
