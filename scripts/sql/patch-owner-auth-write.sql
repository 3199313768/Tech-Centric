-- Phase P2：生产环境写权限加固
-- 替换 patch-projects-rls-write.sql 的匿名全写策略，仅允许已登录用户写入
-- 执行前请确保站主已在各子页登录后再进行 CRUD

-- all_projects
DROP POLICY IF EXISTS "允许匿名用户修改 all_projects" ON public.all_projects;
CREATE POLICY "Authenticated users can manage all_projects"
  ON public.all_projects
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- projects（遗留表，若存在）
DROP POLICY IF EXISTS "允许匿名用户修改 projects" ON public.projects;
CREATE POLICY "Authenticated users can manage projects"
  ON public.projects
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- vibe_coding
DROP POLICY IF EXISTS "允许匿名用户修改 vibe_coding" ON public.vibe_coding;
CREATE POLICY "Authenticated users can manage vibe_coding"
  ON public.vibe_coding
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ai_skills
DROP POLICY IF EXISTS "允许匿名用户修改 ai_skills" ON public.ai_skills;
CREATE POLICY "Authenticated users can manage ai_skills"
  ON public.ai_skills
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- resources
DROP POLICY IF EXISTS "允许匿名用户修改 resources" ON public.resources;
CREATE POLICY "Authenticated users can manage resources"
  ON public.resources
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
