# 若林轻小说社区前端

面向国内小圈子用户的轻小说阅读与创作社区前端，主要包含阅读、投稿、评论、收藏和分享等功能。

## 技术栈

- Nuxt 4 + Vue 3 + TypeScript
- Nuxt UI 4 + Tailwind CSS 4
- Pinia（客户端全局状态）、VueUse（组合函数工具集）
- Vitest + Vue Test Utils + Nuxt Test Utils（单元/组件测试）
- 包管理器：pnpm 11
- 运行时：Node.js 24

详细选型与依赖边界见 [.agents/TECH_STACK.md](.agents/TECH_STACK.md)。

## 环境准备

1. 安装 Node.js 24（仓库根目录 `.nvmrc` 已固定版本，可使用 `nvm use`）；
2. 启用 pnpm：`corepack enable`；
3. 复制环境变量示例：`cp .env.example .env`，按需填写；
4. 安装依赖：`pnpm install`。

## 常用脚本

| 命令 | 作用 |
| --- | --- |
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 生产构建 |
| `pnpm preview` | 预览生产构建 |
| `pnpm lint` | ESLint 检查 |
| `pnpm typecheck` | TypeScript 类型检查 |
| `pnpm test` | 运行单元/组件测试 |

## 开发约定

- 技术栈与依赖边界见 [.agents/TECH_STACK.md](.agents/TECH_STACK.md)。
- 目录职责与文件命名见 [.agents/PROJECT_STRUCTURE.md](.agents/PROJECT_STRUCTURE.md)。
- 产品页面、交互与视觉规范见 [.agents/PRODUCT_DESIGN.md](.agents/PRODUCT_DESIGN.md)。
- AI 或开发者修改代码前必须阅读根目录的 [AGENTS.md](AGENTS.md) 与 [.agents/AI_DEVELOPMENT.md](.agents/AI_DEVELOPMENT.md)。
- 项目采用 Nuxt 4，不创建并行的 Vue/Vite SPA，也不擅自引入功能重复的第三方库。
