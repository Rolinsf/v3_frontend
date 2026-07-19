# 项目目录与命名规范

本文档定义 Nuxt 4 前端项目的目录边界。新增文件必须先判断其职责，再放入对应目录；不允许为了方便创建含义重复或职责模糊的目录。

## 1. 标准目录树

```text
rolinsf-v3/
├── app/                         # Nuxt 客户端应用
│   ├── app.vue                  # 应用根组件，只放全局壳和 NuxtPage
│   ├── error.vue                # 全局错误页面
│   ├── assets/                  # 参与 Vite 构建的样式、字体和本地资源
│   │   └── css/
│   │       ├── main.css         # Tailwind 入口和全局基础样式
│   │       ├── tokens.css       # 颜色、间距、阅读器等 CSS Token
│   │       └── reader.css       # 小说正文排版基础规则
│   ├── components/              # 可复用 Vue 组件，按领域分组
│   │   ├── common/              # 全站通用且不含业务语义的组件
│   │   ├── navigation/          # 顶栏、侧栏、面包屑、移动导航
│   │   ├── novel/               # 小说卡片、信息、标签和目录
│   │   ├── category/            # 分类展示、筛选和两级选择器
│   │   ├── reader/              # 阅读器及阅读设置
│   │   ├── editor/              # 投稿编辑器及工具栏
│   │   ├── comment/             # 评论、回复和评论操作
│   │   └── user/                # 用户头像、用户卡片等展示组件
│   ├── composables/             # 可复用的有状态业务逻辑
│   │   ├── useApi.ts            # API 客户端访问入口
│   │   ├── useAuth.ts           # 登录状态和认证操作
│   │   ├── useReader.ts         # 阅读设置与进度行为
│   │   └── useUpload.ts         # 文件上传流程
│   ├── layouts/                 # 页面布局
│   │   ├── default.vue          # 主站布局
│   │   ├── reader.vue           # 沉浸式阅读布局
│   │   ├── creator.vue          # 作者中心布局
│   │   └── admin.vue            # 管理后台布局
│   ├── middleware/              # 客户端路由中间件
│   │   ├── auth.ts              # 要求登录
│   │   ├── guest.ts             # 仅未登录用户
│   │   └── admin.ts             # 仅管理员后台入口的体验层拦截
│   ├── pages/                   # 文件路由；只做页面组合与数据入口
│   │   ├── index.vue
│   │   ├── login.vue
│   │   ├── search.vue
│   │   ├── novels/
│   │   │   ├── index.vue
│   │   │   └── [novelId]/
│   │   │       ├── index.vue
│   │   │       └── chapters/
│   │   │           └── [chapterId].vue
│   │   ├── bookshelf.vue
│   │   ├── history.vue
│   │   ├── creator/
│   │   ├── account/
│   │   └── admin/
│   ├── plugins/                 # Nuxt 插件，仅放初始化和注入
│   │   └── api.ts               # 创建带统一配置的 $fetch 实例
│   ├── schemas/                 # Zod 运行时 Schema，按领域划分
│   │   ├── auth.ts
│   │   ├── novel.ts
│   │   ├── category.ts
│   │   ├── chapter.ts
│   │   ├── comment.ts
│   │   └── user.ts
│   ├── stores/                  # Pinia 客户端全局状态
│   │   ├── auth.ts
│   │   ├── reader.ts
│   │   ├── editor.ts
│   │   └── notification.ts
│   ├── types/                   # 纯 TypeScript 类型
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── novel.ts
│   │   ├── category.ts
│   │   ├── chapter.ts
│   │   ├── comment.ts
│   │   └── user.ts
│   └── utils/                   # 无状态、无副作用的纯函数
│       ├── format.ts
│       ├── text.ts
│       └── url.ts
├── server/                      # Nitro 服务端层
│   ├── api/                     # 仅在需要 BFF/服务端接口时使用
│   ├── middleware/              # Nitro 请求中间件
│   ├── routes/                  # 非 /api 前缀的服务端路由
│   └── utils/                   # 只在服务端运行的工具
├── shared/                      # 客户端与服务端均可安全引用
│   ├── constants/               # 无环境依赖的常量
│   ├── types/                   # 跨端共享类型
│   └── utils/                   # 跨端纯函数
├── public/                      # 原样发布、不经过 Vite 的静态文件
│   ├── favicon.ico
│   └── images/
├── tests/
│   ├── unit/                    # Vitest 单元和组件测试
│   ├── nuxt/                    # 需要 Nuxt 环境的集成测试
│   ├── e2e/                     # Playwright 端到端测试
│   └── fixtures/                # 测试固定数据
├── docs/                        # 架构、产品和接口文档
├── nuxt.config.ts
├── eslint.config.mjs
├── playwright.config.ts
├── vitest.config.ts
├── tsconfig.json
├── package.json
├── pnpm-lock.yaml
├── .env.example                 # 只写变量名和安全示例，不提交密钥
├── AGENTS.md
└── README.md
```

目录按需求逐步创建，不为尚未实现的功能批量生成空文件。

## 2. 各层职责

### pages

页面负责读取路由、调用数据层、设置 SEO、选择布局并组合领域组件。若单个页面出现大量表单逻辑、格式化逻辑或超过约 300 行，应优先拆分组件或 composable，而不是继续堆积。

- 首页、书库、搜索、排行、小说详情、公开作者页和章节阅读均为公开路由；
- `creator/` 和 `account/` 是登录用户使用的前台功能；
- `admin/` 必须使用管理员中间件，并由后端再次验证管理员权限；
- 不得给公开章节阅读页添加 `auth` 中间件。

### components

- `common/` 只放无业务语义且至少会被多个领域使用的组件。
- 业务组件进入对应领域目录，例如小说卡片只能放入 `novel/`。
- 不创建含糊的 `base/`、`misc/`、`other/`、`temp/` 目录。
- 仅被一个页面使用且高度专有的组件，可以放在对应领域目录中，不在 `pages/` 下复制一套 components 体系。

### composables

Composable 封装可复用的响应式逻辑和副作用。命名必须以 `use` 开头。纯字符串或数组转换函数不放这里，应放入 `utils/`。

### stores

Store 只保存跨页面客户端状态。小说详情、章节正文、评论分页等服务端数据由 Nuxt 数据层管理，不复制进 Pinia。

### schemas、types 与 utils

- `schemas/` 保存 Zod Schema，并尽量通过 `z.infer` 推导类型。
- `types/` 只保存无法从 Schema 推导、或接口生成产物之外的 TypeScript 类型。
- `utils/` 只保存可独立测试的纯函数，不得在导入时读取 Cookie、路由、Window 或运行配置。

### plugins

Plugin 只负责第三方库初始化和 Nuxt 注入。普通业务函数、API endpoint 集合和页面逻辑不得放入 plugins。

### server

`server/` 仅用于 Nitro/BFF 能力、隐藏服务端凭证、代理上游接口或执行 SSR 专用逻辑。业务后端已经提供能力时，不在这里重复实现一套数据库业务。

### shared

只有确定同时被客户端和服务端使用、且不依赖浏览器或 Node 专属 API 的内容才能进入 `shared/`。普通前端类型仍放 `app/types/`。

## 3. 命名规范

| 对象 | 规则 | 示例 |
| --- | --- | --- |
| Vue 组件 | PascalCase | `NovelCard.vue`、`ReaderToolbar.vue` |
| Composable | `use` + PascalCase | `useAuth.ts`、`useReader.ts` |
| Pinia Store 文件 | 单数领域名 | `auth.ts`、`reader.ts` |
| 工具/Schema/类型文件 | kebab-case 或单个小写领域词 | `reading-progress.ts`、`novel.ts` |
| 路由参数 | 有意义的 camelCase | `[novelId]`、`[chapterId]` |
| 测试 | 与被测文件同名加后缀 | `NovelCard.test.ts`、`auth.spec.ts` |
| 常量 | `UPPER_SNAKE_CASE` | `MAX_COVER_SIZE` |
| TypeScript 类型 | PascalCase | `NovelSummary`、`ChapterContent` |

同一概念固定使用以下领域词：

```text
novel        小说
category     两级作品分类
chapter      章节
volume       卷
reader       阅读器
comment      评论
creator      作者/创作中心
bookshelf    书架
history      阅读历史
account      用户自己的账户设置
user         公共用户实体与展示
admin        管理后台
```

禁止在同一项目中混用 `book`/`novel`、`article`/`chapter`、`member`/`user` 等平行表达。

分类统一使用 `category`；不要并行创建 `genre`、`channel`、`section` 等表达同一分类体系的目录或模型。标签统一使用 `tag`，不得用标签替代主分类关系。

## 4. 导入与依赖方向

推荐依赖方向：

```text
pages → components/composables/stores → schemas/types/utils
server → shared
app → shared
```

- 底层 `utils`、`types` 和 `schemas` 不反向导入页面或组件。
- 组件不得直接导入另一个页面文件。
- 客户端代码不得导入 `server/`。
- `shared/` 不得导入 `app/` 或 `server/`。
- 领域组件之间避免循环依赖；跨领域的无业务组件经确认后提取到 `common/`。

## 5. 环境变量

- 可暴露给浏览器的配置放入 `runtimeConfig.public`，名称必须明确。
- 密钥只能放在服务端私有 `runtimeConfig` 或部署环境中。
- 仓库只提交 `.env.example`，不提交 `.env` 和真实凭证。
- 页面和组件不得直接散落读取 `process.env`，统一通过 `useRuntimeConfig()`。

## 6. 下一步实施顺序

目录规范确定后，按以下顺序开发：

1. 创建最小 Nuxt 4 工程骨架和基础配置；
2. 建立 CSS Token、Nuxt UI 主题、四类 Layout 和响应式断点；
3. 定义核心领域模型、Zod Schema 和后端 API 契约；
4. 使用固定假数据完成首页、小说详情和章节阅读三个核心页面；
5. 完成登录态、书架、阅读进度、评论和投稿流程；
6. 接入真实 API、上传、错误处理和权限边界；
7. 补充 SEO、性能优化、核心 E2E 测试与部署配置。

第一阶段的验收纵切应是：用户能从首页进入小说详情，再进入章节并获得完整的移动端阅读体验。它比先铺满所有后台空页面更能验证产品与架构。
