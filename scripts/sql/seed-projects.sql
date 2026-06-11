-- 自动生成的数据插入 SQL

-- =====================================
-- 1. 插入 projects 表数据
-- =====================================
INSERT INTO public.projects (id, title, type, description, detailed_description, image, demo_url, github_url, technologies, highlights, status, start_date, end_date) VALUES (
  '1', 
  '电商平台系统', 
  'React', 
  '基于 React 和 TypeScript 构建的现代化电商平台', 
  '一个功能完整的电商平台，包含商品展示、购物车、订单管理、支付集成等功能。采用现代化的技术栈，确保高性能和良好的用户体验。', 
  NULL, 
  'https://demo.example.com', 
  'https://github.com/example/ecommerce', 
  '{"React","TypeScript","Next.js","Tailwind CSS","Stripe"}', 
  '{"响应式设计","支付集成","实时库存管理","用户评价系统"}', 
  'completed', 
  '2023-01', 
  '2023-06'
) ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title, type = EXCLUDED.type, description = EXCLUDED.description, detailed_description = EXCLUDED.detailed_description, image = EXCLUDED.image, demo_url = EXCLUDED.demo_url, github_url = EXCLUDED.github_url, technologies = EXCLUDED.technologies, highlights = EXCLUDED.highlights, status = EXCLUDED.status, start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date;

INSERT INTO public.projects (id, title, type, description, detailed_description, image, demo_url, github_url, technologies, highlights, status, start_date, end_date) VALUES (
  '2', 
  '智能任务管理器', 
  'Vue', 
  '协作式任务管理应用，支持团队协作', 
  '协作式任务管理应用，支持团队协作、任务分配、进度跟踪等功能。', 
  NULL, 
  'https://demo.example.com', 
  'https://github.com/example/taskmanager', 
  '{"Vue.js","Vuex","Firebase","Vuetify"}', 
  '{"实时协作","任务看板","通知系统","数据可视化"}', 
  'completed', 
  '2023-03', 
  '2023-08'
) ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title, type = EXCLUDED.type, description = EXCLUDED.description, detailed_description = EXCLUDED.detailed_description, image = EXCLUDED.image, demo_url = EXCLUDED.demo_url, github_url = EXCLUDED.github_url, technologies = EXCLUDED.technologies, highlights = EXCLUDED.highlights, status = EXCLUDED.status, start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date;

INSERT INTO public.projects (id, title, type, description, detailed_description, image, demo_url, github_url, technologies, highlights, status, start_date, end_date) VALUES (
  '3', 
  'API 网关服务', 
  'Node', 
  '支持频率限制的微服务 API 网关', 
  '微服务API网关，提供统一入口、限流、认证、监控等功能。', 
  NULL, 
  NULL, 
  'https://github.com/example/apigateway', 
  '{"Node.js","Express","Redis","Docker","Kubernetes"}', 
  '{"限流保护","负载均衡","API监控","自动扩缩容"}', 
  'completed', 
  '2022-09', 
  '2023-02'
) ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title, type = EXCLUDED.type, description = EXCLUDED.description, detailed_description = EXCLUDED.detailed_description, image = EXCLUDED.image, demo_url = EXCLUDED.demo_url, github_url = EXCLUDED.github_url, technologies = EXCLUDED.technologies, highlights = EXCLUDED.highlights, status = EXCLUDED.status, start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date;

INSERT INTO public.projects (id, title, type, description, detailed_description, image, demo_url, github_url, technologies, highlights, status, start_date, end_date) VALUES (
  '4', 
  '分析仪表盘', 
  'React', 
  '实时数据分析仪表板，提供可视化报表', 
  '实时数据分析仪表板，提供数据可视化、报表生成等功能。', 
  NULL, 
  'https://demo.example.com', 
  'https://github.com/example/dashboard', 
  '{"React","D3.js","WebSocket","Chart.js"}', 
  '{"实时数据","多种图表","数据导出","自定义报表"}', 
  'completed', 
  '2023-05', 
  '2023-09'
) ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title, type = EXCLUDED.type, description = EXCLUDED.description, detailed_description = EXCLUDED.detailed_description, image = EXCLUDED.image, demo_url = EXCLUDED.demo_url, github_url = EXCLUDED.github_url, technologies = EXCLUDED.technologies, highlights = EXCLUDED.highlights, status = EXCLUDED.status, start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date;

INSERT INTO public.projects (id, title, type, description, detailed_description, image, demo_url, github_url, technologies, highlights, status, start_date, end_date) VALUES (
  '5', 
  '中台管理系统', 
  'Vue', 
  '功能完善的管理后台，支持角色权限管理', 
  '功能完善的管理后台，支持角色权限管理、数据管理等功能。', 
  NULL, 
  NULL, 
  'https://github.com/example/admin', 
  '{"Vue.js","Element UI","Node.js","PostgreSQL"}', 
  '{"权限管理","数据CRUD","批量操作","操作日志"}', 
  'completed', 
  '2022-11', 
  '2023-04'
) ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title, type = EXCLUDED.type, description = EXCLUDED.description, detailed_description = EXCLUDED.detailed_description, image = EXCLUDED.image, demo_url = EXCLUDED.demo_url, github_url = EXCLUDED.github_url, technologies = EXCLUDED.technologies, highlights = EXCLUDED.highlights, status = EXCLUDED.status, start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date;

INSERT INTO public.projects (id, title, type, description, detailed_description, image, demo_url, github_url, technologies, highlights, status, start_date, end_date) VALUES (
  '6', 
  '实时通信服务器', 
  'Node', 
  '基于 WebSocket 的高性能实时通信服务', 
  '基于WebSocket的实时通信服务器，支持多房间、消息推送等功能。', 
  NULL, 
  NULL, 
  'https://github.com/example/websocket', 
  '{"Node.js","Socket.io","Redis","MongoDB"}', 
  '{"实时通信","房间管理","消息持久化","高并发支持"}', 
  'completed', 
  '2023-01', 
  '2023-05'
) ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title, type = EXCLUDED.type, description = EXCLUDED.description, detailed_description = EXCLUDED.detailed_description, image = EXCLUDED.image, demo_url = EXCLUDED.demo_url, github_url = EXCLUDED.github_url, technologies = EXCLUDED.technologies, highlights = EXCLUDED.highlights, status = EXCLUDED.status, start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date;

INSERT INTO public.projects (id, title, type, description, detailed_description, image, demo_url, github_url, technologies, highlights, status, start_date, end_date) VALUES (
  '7', 
  '通用组件库', 
  'React', 
  '可复用的 React 业务组件库', 
  '可复用的React组件库，包含常用UI组件，支持主题定制。', 
  NULL, 
  'https://demo.example.com', 
  'https://github.com/example/components', 
  '{"React","TypeScript","Storybook","Jest"}', 
  '{"30+组件","TypeScript支持","主题定制","完整文档"}', 
  'completed', 
  '2023-06', 
  '2023-10'
) ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title, type = EXCLUDED.type, description = EXCLUDED.description, detailed_description = EXCLUDED.detailed_description, image = EXCLUDED.image, demo_url = EXCLUDED.demo_url, github_url = EXCLUDED.github_url, technologies = EXCLUDED.technologies, highlights = EXCLUDED.highlights, status = EXCLUDED.status, start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date;

INSERT INTO public.projects (id, title, type, description, detailed_description, image, demo_url, github_url, technologies, highlights, status, start_date, end_date) VALUES (
  '8', 
  '性能优化框架', 
  'Vue', 
  '自定义单页应用性能优化框架', 
  '自定义单页应用框架，提供路由、状态管理等核心功能。', 
  NULL, 
  NULL, 
  'https://github.com/example/spa-framework', 
  '{"Vue.js","TypeScript","Webpack","Vite"}', 
  '{"轻量级","TypeScript支持","插件系统","开发工具"}', 
  'in-progress', 
  '2023-11', 
  NULL
) ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title, type = EXCLUDED.type, description = EXCLUDED.description, detailed_description = EXCLUDED.detailed_description, image = EXCLUDED.image, demo_url = EXCLUDED.demo_url, github_url = EXCLUDED.github_url, technologies = EXCLUDED.technologies, highlights = EXCLUDED.highlights, status = EXCLUDED.status, start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date;

INSERT INTO public.projects (id, title, type, description, detailed_description, image, demo_url, github_url, technologies, highlights, status, start_date, end_date) VALUES (
  '9', 
  '数据库 ORM 库', 
  'Node', 
  '类型安全的 Node.js 数据库 ORM', 
  '类型安全的Node.js数据库ORM，支持多种数据库，提供流畅的API。', 
  NULL, 
  NULL, 
  'https://github.com/example/orm', 
  '{"TypeScript","Node.js","PostgreSQL","MySQL"}', 
  '{"类型安全","多数据库支持","迁移工具","查询构建器"}', 
  'completed', 
  '2022-12', 
  '2023-07'
) ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title, type = EXCLUDED.type, description = EXCLUDED.description, detailed_description = EXCLUDED.detailed_description, image = EXCLUDED.image, demo_url = EXCLUDED.demo_url, github_url = EXCLUDED.github_url, technologies = EXCLUDED.technologies, highlights = EXCLUDED.highlights, status = EXCLUDED.status, start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date;

INSERT INTO public.projects (id, title, type, description, detailed_description, image, demo_url, github_url, technologies, highlights, status, start_date, end_date) VALUES (
  '10', 
  '动画渲染引擎', 
  'React', 
  '高性能 Web 动画库', 
  '高性能动画库，提供流畅的动画效果和丰富的动画API。', 
  NULL, 
  'https://demo.example.com', 
  'https://github.com/example/animation', 
  '{"React","TypeScript","Web Animations API","GSAP"}', 
  '{"高性能","60fps","丰富API","易于使用"}', 
  'completed', 
  '2023-04', 
  '2023-08'
) ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title, type = EXCLUDED.type, description = EXCLUDED.description, detailed_description = EXCLUDED.detailed_description, image = EXCLUDED.image, demo_url = EXCLUDED.demo_url, github_url = EXCLUDED.github_url, technologies = EXCLUDED.technologies, highlights = EXCLUDED.highlights, status = EXCLUDED.status, start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date;

-- =====================================
-- 2. 插入 all_projects 表数据
-- =====================================
INSERT INTO public.all_projects (id, name, url, is_public, category, description, role_and_contribution, tags, screenshots) VALUES (
  'proj-1', 
  '绵阳灌区水资源管理平台', 
  'http://10.0.4.67:8890/water-resource/yzt', 
  false, 
  '数字孪生', 
  '面向绵阳灌区水利局的“一网统管”需求，打造的集 GIS 空间分析、水资源实时监控（雨量/水质/流量）、数据可视化于一体的综合调度大屏平台。', 
  '1. 主导开发“灌区一张图”核心模块：实现 GIS 地图多图层（行政区划、水系、监测站点等）动态叠加，打通地图打点与业务面板的状态联动。
2. 大屏性能与组件化：基于 Vite + UmiJS 重构复杂图表/表单，优化海量 DOM 与频发数据的渲染性能。
3. 首推 AI 辅助编程入流：主导制定并落地前端 SOP，团队交付效能提升约 30%。', 
  '{"React","UmiJS","Vite","GIS","大屏可视化"}', 
  '{"https://picsum.photos/seed/mygq/800/450"}'
) ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, url = EXCLUDED.url, is_public = EXCLUDED.is_public, category = EXCLUDED.category, description = EXCLUDED.description, role_and_contribution = EXCLUDED.role_and_contribution, tags = EXCLUDED.tags, screenshots = EXCLUDED.screenshots;

INSERT INTO public.all_projects (id, name, url, is_public, category, description, role_and_contribution, tags, screenshots) VALUES (
  'proj-2', 
  '远算官网 (HPC 与数字孪生产品矩阵)', 
  'https://www.yuansuan.work/products/hpc', 
  true, 
  '门户与展现', 
  '作为远算科技对外展示的核心门户，全面呈现 HPC 平台、通用 CAE、专用 App 及数字孪生等核心业务线体系，承担品牌背书与 B 端客户引流的重任。', 
  '1. 复杂动效与视觉还原：负责官网强展现类 C 端体验落地，运用高级动画库（如 Framer Motion / GSAP）实现首屏渲染与丝滑的滚动加载动效。
2. SEO 与响应式架构：基于 Next.js 等服务端渲染/静态生成技术搭建，保证搜索引擎收录效率，并完美适配桌面、平板机移动端的多端尺寸。
3. 高性能优化：对门户展示的高清媒体素材进行预加载与懒加载策略实现，LCP 时间大幅缩短。', 
  '{"React","Next.js","Framer Motion","SEO适配","Responsive Design"}', 
  '{"https://picsum.photos/seed/yuansuan/800/450"}'
) ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, url = EXCLUDED.url, is_public = EXCLUDED.is_public, category = EXCLUDED.category, description = EXCLUDED.description, role_and_contribution = EXCLUDED.role_and_contribution, tags = EXCLUDED.tags, screenshots = EXCLUDED.screenshots;

INSERT INTO public.all_projects (id, name, url, is_public, category, description, role_and_contribution, tags, screenshots) VALUES (
  'proj-3', 
  '观桥水库', 
  'http://10.0.4.129:8570/yy', 
  false, 
  '数字孪生', 
  '无确切信息', 
  '无确切信息', 
  '{"React"}', 
  '{"https://picsum.photos/seed/gqsk/800/450"}'
) ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, url = EXCLUDED.url, is_public = EXCLUDED.is_public, category = EXCLUDED.category, description = EXCLUDED.description, role_and_contribution = EXCLUDED.role_and_contribution, tags = EXCLUDED.tags, screenshots = EXCLUDED.screenshots;

INSERT INTO public.all_projects (id, name, url, is_public, category, description, role_and_contribution, tags, screenshots) VALUES (
  'proj-4', 
  '高家湾水库上游来水预报系统', 
  'http://10.0.64.4:8340/#/overview', 
  false, 
  '数字孪生', 
  '无确切信息', 
  '无确切信息', 
  '{"React"}', 
  '{"https://picsum.photos/seed/gjw/800/450"}'
) ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, url = EXCLUDED.url, is_public = EXCLUDED.is_public, category = EXCLUDED.category, description = EXCLUDED.description, role_and_contribution = EXCLUDED.role_and_contribution, tags = EXCLUDED.tags, screenshots = EXCLUDED.screenshots;

INSERT INTO public.all_projects (id, name, url, is_public, category, description, role_and_contribution, tags, screenshots) VALUES (
  'proj-5', 
  '杜寨水库大坝健康管理数字孪生平台', 
  'http://10.0.64.4:8220/', 
  false, 
  '数字孪生', 
  '无确切信息', 
  '无确切信息', 
  '{"React"}', 
  '{"https://picsum.photos/seed/dzsk/800/450"}'
) ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, url = EXCLUDED.url, is_public = EXCLUDED.is_public, category = EXCLUDED.category, description = EXCLUDED.description, role_and_contribution = EXCLUDED.role_and_contribution, tags = EXCLUDED.tags, screenshots = EXCLUDED.screenshots;

INSERT INTO public.all_projects (id, name, url, is_public, category, description, role_and_contribution, tags, screenshots) VALUES (
  'proj-6', 
  '围滩水库大坝数字孪生系统', 
  'http://10.0.4.128:8450/#/overview', 
  false, 
  '数字孪生', 
  '无确切信息', 
  '无确切信息', 
  '{"React"}', 
  '{"https://picsum.photos/seed/wtsk/800/450"}'
) ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, url = EXCLUDED.url, is_public = EXCLUDED.is_public, category = EXCLUDED.category, description = EXCLUDED.description, role_and_contribution = EXCLUDED.role_and_contribution, tags = EXCLUDED.tags, screenshots = EXCLUDED.screenshots;

INSERT INTO public.all_projects (id, name, url, is_public, category, description, role_and_contribution, tags, screenshots) VALUES (
  'proj-7', 
  '老龙口水库大坝工程安全平台', 
  'http://10.0.4.129:8360/dam/predict/base-info', 
  false, 
  '后台与管理系统', 
  '无确切信息', 
  '无确切信息', 
  '{"React"}', 
  '{"https://picsum.photos/seed/llk/800/450"}'
) ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, url = EXCLUDED.url, is_public = EXCLUDED.is_public, category = EXCLUDED.category, description = EXCLUDED.description, role_and_contribution = EXCLUDED.role_and_contribution, tags = EXCLUDED.tags, screenshots = EXCLUDED.screenshots;

INSERT INTO public.all_projects (id, name, url, is_public, category, description, role_and_contribution, tags, screenshots) VALUES (
  'proj-8', 
  '微信公众号后台', 
  'http://woam-test.intern.yuansuan.com/wx/wxgzhgl/addnews', 
  false, 
  '后台与管理系统', 
  '无确切信息', 
  '无确切信息', 
  '{"React"}', 
  '{"https://picsum.photos/seed/wxgzh/800/450"}'
) ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, url = EXCLUDED.url, is_public = EXCLUDED.is_public, category = EXCLUDED.category, description = EXCLUDED.description, role_and_contribution = EXCLUDED.role_and_contribution, tags = EXCLUDED.tags, screenshots = EXCLUDED.screenshots;

INSERT INTO public.all_projects (id, name, url, is_public, category, description, role_and_contribution, tags, screenshots) VALUES (
  'proj-9', 
  '超大型冷却塔', 
  'http://10.0.4.129:8550/home/graph', 
  false, 
  '数字孪生', 
  '无确切信息', 
  '无确切信息', 
  '{"React"}', 
  '{"https://picsum.photos/seed/cdxlqt/800/450"}'
) ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, url = EXCLUDED.url, is_public = EXCLUDED.is_public, category = EXCLUDED.category, description = EXCLUDED.description, role_and_contribution = EXCLUDED.role_and_contribution, tags = EXCLUDED.tags, screenshots = EXCLUDED.screenshots;

INSERT INTO public.all_projects (id, name, url, is_public, category, description, role_and_contribution, tags, screenshots) VALUES (
  'proj-10', 
  '苏热核电设备力学计算分析平台', 
  'http://10.0.64.4:8330/fealist', 
  false, 
  '后台与管理系统', 
  '无确切信息', 
  '无确切信息', 
  '{"React"}', 
  '{"https://picsum.photos/seed/sr/800/450"}'
) ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, url = EXCLUDED.url, is_public = EXCLUDED.is_public, category = EXCLUDED.category, description = EXCLUDED.description, role_and_contribution = EXCLUDED.role_and_contribution, tags = EXCLUDED.tags, screenshots = EXCLUDED.screenshots;

INSERT INTO public.all_projects (id, name, url, is_public, category, description, role_and_contribution, tags, screenshots) VALUES (
  'proj-11', 
  '宁德核电力学计算分析平台', 
  'http://10.0.4.66:8820/#/home', 
  false, 
  '后台与管理系统', 
  '无确切信息', 
  '无确切信息', 
  '{"React"}', 
  '{"https://picsum.photos/seed/nd/800/450"}'
) ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, url = EXCLUDED.url, is_public = EXCLUDED.is_public, category = EXCLUDED.category, description = EXCLUDED.description, role_and_contribution = EXCLUDED.role_and_contribution, tags = EXCLUDED.tags, screenshots = EXCLUDED.screenshots;

INSERT INTO public.all_projects (id, name, url, is_public, category, description, role_and_contribution, tags, screenshots) VALUES (
  'proj-12', 
  '企业画像平台', 
  'http://10.0.4.66:8870/login', 
  false, 
  '后台与管理系统', 
  '无确切信息', 
  '无确切信息', 
  '{"React"}', 
  '{"https://picsum.photos/seed/qyhx/800/450"}'
) ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, url = EXCLUDED.url, is_public = EXCLUDED.is_public, category = EXCLUDED.category, description = EXCLUDED.description, role_and_contribution = EXCLUDED.role_and_contribution, tags = EXCLUDED.tags, screenshots = EXCLUDED.screenshots;

INSERT INTO public.all_projects (id, name, url, is_public, category, description, role_and_contribution, tags, screenshots) VALUES (
  'proj-13', 
  '藻渡水库数字孪生平台', 
  'http://10.0.4.66:8880/overview', 
  false, 
  '数字孪生', 
  '无确切信息', 
  '无确切信息', 
  '{"React"}', 
  '{"https://picsum.photos/seed/zdsk/800/450"}'
) ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, url = EXCLUDED.url, is_public = EXCLUDED.is_public, category = EXCLUDED.category, description = EXCLUDED.description, role_and_contribution = EXCLUDED.role_and_contribution, tags = EXCLUDED.tags, screenshots = EXCLUDED.screenshots;

INSERT INTO public.all_projects (id, name, url, is_public, category, description, role_and_contribution, tags, screenshots) VALUES (
  'proj-14', 
  '巴图湾水库四预平台', 
  'http://10.0.4.128:8470/overview', 
  false, 
  '数字孪生', 
  '无确切信息', 
  '无确切信息', 
  '{"React"}', 
  '{"https://picsum.photos/seed/btw/800/450"}'
) ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, url = EXCLUDED.url, is_public = EXCLUDED.is_public, category = EXCLUDED.category, description = EXCLUDED.description, role_and_contribution = EXCLUDED.role_and_contribution, tags = EXCLUDED.tags, screenshots = EXCLUDED.screenshots;

INSERT INTO public.all_projects (id, name, url, is_public, category, description, role_and_contribution, tags, screenshots) VALUES (
  'proj-15', 
  'OA协同办公系统', 
  'http://10.0.4.66:8860/#/flow/flowForm/formDesign?id=16', 
  false, 
  '后台与管理系统', 
  '无确切信息', 
  '无确切信息', 
  '{"React"}', 
  '{"https://picsum.photos/seed/oa/800/450"}'
) ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, url = EXCLUDED.url, is_public = EXCLUDED.is_public, category = EXCLUDED.category, description = EXCLUDED.description, role_and_contribution = EXCLUDED.role_and_contribution, tags = EXCLUDED.tags, screenshots = EXCLUDED.screenshots;

INSERT INTO public.all_projects (id, name, url, is_public, category, description, role_and_contribution, tags, screenshots) VALUES (
  'proj-16', 
  '远算小水库水工情模型平台', 
  'http://10.0.4.129:8288/reservoirModel/manage', 
  false, 
  '后台与管理系统', 
  '无确切信息', 
  '无确切信息', 
  '{"React"}', 
  '{"https://picsum.photos/seed/ysxsk/800/450"}'
) ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, url = EXCLUDED.url, is_public = EXCLUDED.is_public, category = EXCLUDED.category, description = EXCLUDED.description, role_and_contribution = EXCLUDED.role_and_contribution, tags = EXCLUDED.tags, screenshots = EXCLUDED.screenshots;

INSERT INTO public.all_projects (id, name, url, is_public, category, description, role_and_contribution, tags, screenshots) VALUES (
  'proj-17', 
  '淳安全流域洪涝风险预测预警数字孪生平台', 
  'http://10.0.4.67:8056/dashboard', 
  false, 
  '数字孪生', 
  '无确切信息', 
  '无确切信息', 
  '{"React"}', 
  '{"https://picsum.photos/seed/ca/800/450"}'
) ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, url = EXCLUDED.url, is_public = EXCLUDED.is_public, category = EXCLUDED.category, description = EXCLUDED.description, role_and_contribution = EXCLUDED.role_and_contribution, tags = EXCLUDED.tags, screenshots = EXCLUDED.screenshots;

INSERT INTO public.all_projects (id, name, url, is_public, category, description, role_and_contribution, tags, screenshots) VALUES (
  'proj-18', 
  '临安小流域', 
  'http://10.0.4.67:8600/slyzt?watershedId=1', 
  false, 
  '数字孪生', 
  '无确切信息', 
  '无确切信息', 
  '{"React"}', 
  '{"https://picsum.photos/seed/laxly/800/450"}'
) ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, url = EXCLUDED.url, is_public = EXCLUDED.is_public, category = EXCLUDED.category, description = EXCLUDED.description, role_and_contribution = EXCLUDED.role_and_contribution, tags = EXCLUDED.tags, screenshots = EXCLUDED.screenshots;

INSERT INTO public.all_projects (id, name, url, is_public, category, description, role_and_contribution, tags, screenshots) VALUES (
  'proj-19', 
  'SME微前端企业级平台前台', 
  'https://sme.intern.yuansuan.cn/', 
  true, 
  '门户与展现', 
  '内部核心企业服务平台（ECS）前台门户，用于聚合远算内外部复杂的业务线模块应用，支持多子应用的无缝接入与一站式操作体验。', 
  '1. 微前端架构落地：基于 qiankun 框架主导从 0 到 1 的微前端基座（Master）搭建。成功实现了对子应用的生命周期（bootstrap/mount/unmount/update）完美代理接管与挂载。
2. 资源隔离与加载通信：利用 Vite 构建体系，解决主子应用间的 CSS 样式污染（沙箱隔离）以及跨模块状态通信问题，实现在同屏内无感加载多个异构系统。
3. 前置代理与鉴权中枢：在基座层（Master）前置实现了全站统一的基础路由与 SSO 单点登录拦截流，显著降低各子系统的接入开发成本。', 
  '{"React","Qiankun","微前端","Vite","平台基座","SSO"}', 
  '{"https://picsum.photos/seed/smeqt/800/450"}'
) ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, url = EXCLUDED.url, is_public = EXCLUDED.is_public, category = EXCLUDED.category, description = EXCLUDED.description, role_and_contribution = EXCLUDED.role_and_contribution, tags = EXCLUDED.tags, screenshots = EXCLUDED.screenshots;

INSERT INTO public.all_projects (id, name, url, is_public, category, description, role_and_contribution, tags, screenshots) VALUES (
  'proj-20', 
  'SME官网后台用户管理', 
  'http://10.0.18.13:30001/', 
  false, 
  '后台与管理系统', 
  '无确切信息', 
  '无确切信息', 
  '{"React"}', 
  '{"https://picsum.photos/seed/smeht/800/450"}'
) ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, url = EXCLUDED.url, is_public = EXCLUDED.is_public, category = EXCLUDED.category, description = EXCLUDED.description, role_and_contribution = EXCLUDED.role_and_contribution, tags = EXCLUDED.tags, screenshots = EXCLUDED.screenshots;

