-- 依赖：public.profiles 已存在
-- 只替换写策略；保留既有 SELECT / is_public 只读策略（勿误删）

DROP POLICY IF EXISTS "Authenticated users can manage all_projects" ON public.all_projects;
CREATE POLICY "Super admins can manage all_projects"
  ON public.all_projects
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "Authenticated users can manage projects" ON public.projects;
CREATE POLICY "Super admins can manage projects"
  ON public.projects
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "Authenticated users can manage vibe_coding" ON public.vibe_coding;
CREATE POLICY "Super admins can manage vibe_coding"
  ON public.vibe_coding
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "Authenticated users can manage ai_skills" ON public.ai_skills;
CREATE POLICY "Super admins can manage ai_skills"
  ON public.ai_skills
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "Authenticated users can manage resources" ON public.resources;
CREATE POLICY "Super admins can manage resources"
  ON public.resources
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "Only owner can manage records" ON public.kb_records;
CREATE POLICY "Super admins can manage kb_records"
  ON public.kb_records
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'super_admin'
    )
  );
