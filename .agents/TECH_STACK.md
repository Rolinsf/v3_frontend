# 前端技术栈与依赖选型

本文档是项目技术选型的唯一基准。目标是保证长期稳定、SSR 兼容、依赖精简，并防止后续开发或 AI 重复引入同类工具。

## 1. 基础环境

| 领域 | 选型 | 约束 |
| --- | --- | --- |
| 运行时 | Node.js 24 | 开发、测试和生产环境统一使用 Node.js 24 |
| 包管理器 | pnpm | 不混用 pnpm、Yarn 或 Bun |
| 应用框架 | Nuxt 4 | 使用 Nuxt 的目录结构、路由和渲染体系 |
| UI 框架 | Vue 3 | 使用 Composition API 与 `<script setup>` |
| 语言 | TypeScript | 开启严格模式，避免无理由使用 `any` |
| 前端构建 | Vite | 使用 Nuxt 默认集成，不另建 Vite 配置体系 |
| 服务端构建 | Nitro | 默认部署目标为 `node-server` |
| 代码格式 | ESLint + Prettier | 不再引入并行的格式化/检查体系 |

构建链固定为：

```text
pnpm → Nuxt 4 → Vite（客户端）+ Nitro（服务端）→ Node.js 24
```

## 2. 已选第三方库

| 能力 | 选型 | 使用范围 |
| --- | --- | --- |
| UI 组件 | Nuxt UI 4 | 通用按钮、表单、弹窗、菜单、分页和通知 |
| 样式 | Tailwind CSS 4 | 页面布局、主题 Token 和领域组件样式 |
| 状态管理 | Pinia / `@pinia/nuxt` | 登录展示状态、阅读设置、通知和编辑草稿等客户端状态 |
| 数据请求 | `useFetch`、`useAsyncData`、`$fetch` | SSR 数据、页面数据和用户操作请求 |
| 表单 | VeeValidate | 表单状态、错误展示和提交过程 |
| Schema | Zod | 表单、运行时数据和关键 API 结构校验 |
| 富文本 | Tiptap Vue 3 | 小说章节投稿与编辑 |
| 图片 | `@nuxt/image` | 封面、头像、插图和响应式图片 |
| SEO | Nuxt SEO API + `@nuxtjs/seo` | Meta、Canonical、Sitemap、Robots 和结构化数据 |
| 组合函数 | `@vueuse/nuxt` | 仅使用确有需要的浏览器与 Vue 工具 |
| 日期 | date-fns | 日期解析、计算和格式化 |
| 图标 | Nuxt Icon / Iconify | 全站图标，保持单一来源 |
| 单元/组件测试 | Vitest + Vue Test Utils + Nuxt Test Utils | 工具函数、组件和 Nuxt 上下文测试 |
| 端到端测试 | Playwright | 登录、阅读、评论和投稿等核心流程 |
| 提交检查 | simple-git-hooks + lint-staged | 提交前只检查本次变更文件 |

依赖安装时采用当前稳定主版本，并通过 `pnpm-lock.yaml` 锁定精确解析结果。主版本升级必须单独评估迁移成本，不在普通功能开发中顺手升级。

## 3. 明确不引入的重复方案

除非负责人批准架构变更，禁止加入以下类别：

| 禁止项 | 原因/现有替代 |
| --- | --- |
| Vue + Vite 独立 SPA | 主站已经使用 Nuxt，不维护第二套应用架构 |
| Webpack、Rspack、自建 Rollup | 使用 Nuxt 默认 Vite/Nitro 构建链 |
| Element Plus、Naive UI、Ant Design Vue、Vuetify | 与 Nuxt UI 重复 |
| Bootstrap、UnoCSS、第二套 Tailwind | 与 Tailwind CSS 重复 |
| Axios、SuperAgent | `$fetch` 已覆盖通用 HTTP 请求 |
| Vuex、Zustand | Pinia 已覆盖客户端全局状态 |
| TanStack Query、SWRV | 第一阶段使用 Nuxt 数据获取和缓存能力 |
| Joi、Yup、Valibot | 与 Zod 重复 |
| FormKit、其他综合表单框架 | 与 VeeValidate 重复 |
| Quill、TinyMCE、CKEditor、WangEditor | 与 Tiptap 重复 |
| Moment.js、Day.js | date-fns 已覆盖日期能力 |
| lodash 全量包 | 优先原生 API、VueUse 或按需的小型本地工具 |
| 第二套图标库 | 使用 Nuxt Icon / Iconify |
| Socket.IO、GraphQL、PWA、i18n | 当前不是基础需求，出现明确需求后再评估 |

“禁止”指不得在普通任务中自行添加；如果现有方案确实无法满足新需求，应先提交技术理由并取得确认。

## 4. 数据与状态边界

### Nuxt 数据层

以下数据使用 `useFetch`、`useAsyncData` 或 `$fetch`：

- 首页推荐、排行榜和分类列表；
- 小说详情、章节正文和目录；
- 评论列表、搜索结果和作者公开信息；
- 任何需要 SSR、SEO、刷新或服务端缓存的数据。

### Pinia

Pinia 只保存：

- 当前用户的客户端展示状态；
- 阅读主题、字体、字号、行高和页面宽度；
- 未读通知数量；
- 跨页面投稿草稿及编辑器状态；
- 全局 UI 状态。

不得把整个小说详情、章节列表或评论分页长期复制到 Pinia。

## 5. 页面渲染策略

| 页面 | 默认策略 |
| --- | --- |
| 首页、分类、排行榜 | SSR + 合理缓存 |
| 小说详情、作者公开页 | SSR |
| 章节阅读页 | SSR，阅读设置在客户端增强 |
| 帮助、协议 | 预渲染/静态生成 |
| 书架、历史、个人中心 | 登录态动态页面 |
| 投稿与审核后台 | 以客户端交互为主 |

不要全站关闭 SSR。访问浏览器专属 API 时必须使用客户端生命周期、`import.meta.client` 或 `.client.vue` 等明确边界。

## 6. 编辑器与内容安全

Tiptap 第一阶段仅提供段落、标题、粗体、斜体、删除线、分隔线、图片、作者注、撤销重做、占位提示和字数统计。

章节建议保存：

- Tiptap JSON：继续编辑的权威格式；
- 纯文本：搜索、审核和字数统计；
- 由后端清洗后生成的展示 HTML。

前端不得把未经后端清洗的用户 HTML 直接通过 `v-html` 展示。

## 7. 上传、认证与安全

- 普通图片先用浏览器 `FormData` 与 `$fetch`，只有明确需要分片、断点续传或批量队列时才评估 Uppy。
- 推荐由后端签发上传凭证，浏览器直传对象存储，完成后向后端确认文件 ID。
- 认证使用后端 Session 和 Secure、HttpOnly、SameSite Cookie。
- 不在 `localStorage` 保存长期访问令牌或敏感用户数据。
- 前端路由守卫和校验只改善体验，权限、内容审核和数据校验必须由后端执行。
- 公开作品浏览和章节阅读不要求登录；未登录阅读设置和进度可以保存在本地。
- 点赞、评论、回复、收藏、投稿和个人管理等身份操作按需触发登录。
- 普通用户的作品、资料和评论管理属于前台用户空间；`/admin/**` 只允许管理员访问。
- 小说分类采用管理员维护的固定两级分类树；作者创建作品时选择一个一级分类及其下的一个二级分类。
- 分类和标签是不同模型：分类用于主导航与搜索筛选，标签用于多选的内容特征补充。

## 8. 目录边界

完整目录树、目录职责和命名规则统一遵循 `.agents/PROJECT_STRUCTURE.md`。页面文件负责组合，不堆积大型领域逻辑；可复用业务行为放入 composable，纯函数放入 utils，运行时数据结构放入 schemas。

## 9. 依赖变更检查表

提交新增依赖前必须确认：

- [ ] 现有 Vue、Nuxt、浏览器 API 或已安装依赖不能合理完成需求；
- [ ] 没有与现有选型重复；
- [ ] 支持 Nuxt 4、Vue 3、SSR 和 TypeScript；
- [ ] 支持 Node.js 24；
- [ ] 使用稳定版本且仍在积极维护；
- [ ] 许可证适用；
- [ ] 客户端体积和安全风险可以接受；
- [ ] 已补充必要测试和本文档说明；
- [ ] `pnpm-lock.yaml` 已同步更新。
