-- 允许匿名用户插入、更新和删除 projects 表的数据
CREATE POLICY "允许匿名用户修改 projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);

-- 允许匿名用户插入、更新和删除 all_projects 表的数据
CREATE POLICY "允许匿名用户修改 all_projects" ON public.all_projects FOR ALL USING (true) WITH CHECK (true);

-- 注意：上面的策略会赋予 public/anon 角色完全的操作权限 (增删改查)。
-- 对于个人的开源作品集来说，如果在管理后台外进行临时操作是可以的，但在生产环境中建议增加鉴权 (Auth)。
