export type ProjectCategory = '数字孪生' | '后台与管理系统' | '门户与展现' | '未分类';

export interface AllProjectItem {
  id: string;
  name: string;
  url: string; // 内网或无权访问的地址
  isPublic: boolean; // 是否可公网直接访问
  category: ProjectCategory;
  description: string;
  roleAndContribution: string; // 核心贡献与难点
  tags: string[];
  screenshots: string[];
}

