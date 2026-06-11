-- Phase B：blogPosts 种子迁移至 vibe_coding（article）
-- 可重复执行（ON CONFLICT DO NOTHING）

INSERT INTO public.vibe_coding (id, name, description, url, icon, kind, slug, body, is_public, tags) VALUES
(
  'blog-react-perf',
  'React性能优化最佳实践',
  '深入探讨React应用性能优化的各种技巧和策略...',
  '',
  '📝',
  'article',
  'react-perf-blog-react-perf',
  '深入探讨React应用性能优化的各种技巧和策略，包括 memo、useMemo、虚拟列表与代码分割等实践。',
  true,
  ARRAY['React', '性能优化', '前端']
),
(
  'blog-ts-types',
  'TypeScript高级类型系统',
  '学习TypeScript的高级类型特性，提升代码质量...',
  '',
  '📝',
  'article',
  'typescript-ts-types-blog-ts-types',
  '学习 TypeScript 的高级类型特性：条件类型、映射类型、模板字面量类型与 infer，提升代码质量与可维护性。',
  true,
  ARRAY['TypeScript', '类型系统']
),
(
  'blog-microservices',
  '微服务架构设计思考',
  '分享微服务架构设计中的经验和教训...',
  '',
  '📝',
  'article',
  'microservices-blog-microservices',
  '分享微服务架构设计中的经验与教训：服务边界、数据一致性、观测性与团队组织对齐。',
  true,
  ARRAY['微服务', '架构', '后端']
)
ON CONFLICT (id) DO NOTHING;
