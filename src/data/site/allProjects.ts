export type ProjectCategory = '数字孪生' | '后台与管理系统' | '门户与展现' | '未分类';

export interface AllProjectItem {
  id: string;
  slug: string;
  name: string;
  url: string;
  isPublic: boolean;
  category: ProjectCategory;
  description: string;
  roleAndContribution: string;
  tags: string[];
  screenshots: string[];
  body: string;
  highlights: string[];
  techStack: string[];
  period: string;
  role: string;
  isFeatured: boolean;
}
