# AI 开发约束

本文档是本仓库所有 AI 编码代理和开发者必须遵守的工程约束。

## 开始工作前

1. 完整阅读 `.agents/TECH_STACK.md`、`.agents/PROJECT_STRUCTURE.md` 和 `.agents/PRODUCT_DESIGN.md`。
2. 检查 `package.json`、`pnpm-lock.yaml` 和现有实现，优先复用已有依赖与组件。
3. 不得因为个人偏好替换已经确定的技术方案。

## 强制规则

- 应用框架固定为 Nuxt 4 + Vue 3 + TypeScript，构建使用 Nuxt 默认的 Vite 与 Nitro。
- 初始化新工程必须优先使用 Nuxt 官方 `nuxi init` 命令；只有修复或补充现有工程时才逐个创建文件。
- 包管理器只使用 pnpm；必须提交并保持 `pnpm-lock.yaml`。
- UI 使用 Nuxt UI 4 和 Tailwind CSS 4；不得再引入另一套综合 UI 或 CSS 框架。
- 服务端数据使用 Nuxt `useFetch`、`useAsyncData` 和 `$fetch`；不得引入 Axios 或另一套通用请求客户端。
- Pinia 只保存客户端跨页面状态，不得复制或长期保存可由 Nuxt 数据层管理的服务端数据。
- 表单使用 VeeValidate，结构校验使用 Zod；不得引入功能重复的表单或 Schema 库。
- 富文本编辑使用 Tiptap；不得同时引入另一套富文本编辑器。
- 图片使用 `@nuxt/image`；SEO 使用 Nuxt 原生 SEO API 和 `@nuxtjs/seo`。
- 测试使用 Vitest、Vue Test Utils、Nuxt Test Utils 和 Playwright。
- 优先使用 Vue、Nuxt、浏览器原生 API 和已安装依赖，不为一个简单工具函数新增 pnpm 包。
- 不得使用已停止维护、已 EOL 或仅有预发布版本的依赖。
- 不得手工编辑生成目录，例如 `.nuxt/`、`.output/`、`dist/` 和 `node_modules/`。
- 新文件必须放入 `.agents/PROJECT_STRUCTURE.md` 指定的目录；不得在仓库根目录、`app/components/` 或 `app/utils/` 随意堆放业务文件。
- 目录按业务领域组织，禁止同时存在 `novel/`、`novels/`、`book/` 等表达同一领域的平行命名。
- 页面布局、颜色、字体、组件气质和响应式行为必须遵循 `.agents/PRODUCT_DESIGN.md`，不得擅自改成高饱和、重阴影或后台模板风格。
- 分类固定为管理员维护的两级 `category` 树；不得擅自加入第三级、允许作者创建分类，或把分类与 `tag` 合并成同一模型。

## 新增依赖的门槛

新增任何运行时依赖前，必须在交付说明中回答：

1. 现有依赖为什么无法完成需求？
2. 新依赖是否与已有库功能重叠？
3. 是否支持 Vue 3、Nuxt 4、SSR、TypeScript 和项目规定的 Node.js LTS？
4. 包是否持续维护，许可证是否允许项目使用？
5. 对客户端体积、服务端构建和安全面的影响是什么？

无法明确回答时不得添加依赖。大范围替换技术栈必须先获得项目负责人确认。

## 产品与权限边界

- 首页、书库、搜索、排行、小说详情、作者公开页、评论列表和公开章节阅读均无需登录。
- 点赞、评论、回复、举报、收藏、投稿和个人管理等身份操作按需触发登录。
- 普通用户的作品、资料和评论管理属于前台用户空间。
- `/admin/**` 只允许管理员访问，并必须由后端再次验证权限。
- 认证默认采用后端 Session + Secure、HttpOnly、SameSite Cookie；不要把长期令牌放入 `localStorage`。
- 用户提交的 HTML、图片和文件均不可信；前端校验不能替代后端校验、消毒和权限检查。

## 实现边界

- SSR 页面中访问 `window`、`document`、`localStorage` 等浏览器 API时，必须限定在客户端生命周期或客户端组件中。
- 阅读器、投稿编辑器等领域组件放在独立目录中，避免把业务逻辑堆入页面文件。
- 除非需求明确需要，否则不要提前加入 WebSocket、PWA、国际化、微前端、GraphQL 或第二套状态/缓存方案。
- 不为尚未实现的功能批量创建空目录、空组件和占位接口。
