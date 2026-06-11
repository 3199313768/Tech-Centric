# Site UI（`(site)` 路由）

与 [app/(site)/](../../app/(site)/) 页面对应，按路由分子目录。

| 目录 | 页面 | 组件 |
|------|------|------|
| [shell/](./shell/) | 全站 `(site)` layout | `SiteShell`、`Navigation`、首页光标特效 |
| [landing/](./landing/) | `/` | `SpiritGardenHome`、`SpiritDustCanvas` |
| [projects/](./projects/) | `/projects` | `AllProjects`、`AddAllProjectModal` |
| [skills/](./skills/) | `/skills` | `AiSkills`、`AddSkillModal` |
| [vibe/](./vibe/) | `/vibe` | `VibeCoding`、`AddVibeModal` |
| [resources/](./resources/) | `/resources` | `ResourceLinks` |

主题切换与 `ThemeProvider` 在 [components/spirit/theme/](../spirit/theme/)。

子页共用 UI（`SpiritSubpageHero`、`SpiritListCard` 等）在 `components/spirit/`。
