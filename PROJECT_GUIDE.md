# me.frankfu.cloud 项目交接说明

> 一份给「接手维护这个博客的人 / AI 助手」的完整说明。读完这一篇，就能独立发文、配图、部署。

---

## 1. 这是什么

- **站点**：me.frankfu.cloud —— 个人生活博客（区别于技术博客 blog.frankfu.cloud）
- **定位**：生活向。记录读书、思考、副业、学英语、兴趣、生活。**不写硬核技术**（那些去技术博客）。
- **仓库**：github.com/survivorff/me
- **框架**：[Fuwari](https://github.com/saicaca/fuwari)（Astro + Tailwind + Svelte）
- **部署**：push 到 `main` → GitHub Actions 自动 build & 部署到 GitHub Pages
- **作者**：survivorff / Frank，杭州，交易所后端工程师，养两只猫

## 2. 技术栈与环境

- 包管理：**pnpm**（不是 npm）
- Node：**22+**（Fuwari 要求，别用 20）
- 本地命令：
  - `pnpm install` 装依赖
  - `pnpm build` 构建（本地 macOS 偶发 rollup/tailwind 原生二进制报错或 `markdown.css` 的 @apply 报错 —— **这是本地缓存问题，不是真错误**。解决：`rm -rf node_modules/.vite .astro dist` 再 build。CI 在 Linux 上从不出这问题）
  - 不要用 `pnpm dev` 长跑（会阻塞）；验证用 `pnpm build`

## 3. 文章怎么放

- 位置：`src/content/posts/<slug>.md`
- 文件名即 slug，格式：`YYYY-MM-DD-英文短名.md`，URL 会是 `/posts/<slug>/`
- Frontmatter schema（见 `src/content/config.ts`）：
  ```yaml
  ---
  title: "标题"          # ⚠️ 含 # : " 等字符必须加引号（# 前有空格会被 YAML 当注释截断！）
  published: 2026-07-15   # 日期
  description: 一句话摘要
  image: './<slug>-cover.png'   # 封面，见第 4 节；没有就 ''
  tags: [标签1, 标签2]
  category: 副业          # 只能一个：读书/旅行/健康/兴趣/生活/思考/副业
  draft: false            # 先 true 给作者过目，确认后改 false
  ---
  ```
- 快速起草：`pnpm new-post <slug> --cat <分类>`（模板见 `templates/`，支持 读书/旅行/健康/兴趣/生活/副业/英语）

## 4. 封面规则（重要，作者很在意）

**规则写在 `CONTENT_PLAN.md` 和 `.kiro/steering/me-blog-covers.md`，务必遵守：**

- **每篇文章的封面都要为该文单独设计**，根据这篇的主题/情绪/意象重新构思配色、构图、图形。**不套模板、不复用旧风格**，相邻文章视觉要有明显区别。
- **作者给了真实照片 → 永远优先用照片**（如生日那篇的蛋糕图）。
- 做法：手写一段 SVG（1200×630）→ 用 sharp 渲染成 PNG → 存为 `src/content/posts/<slug>-cover.png` → frontmatter `image` 指过去。**PNG 提交进仓库**，CI 不参与渲染（避免中文字体缺失）。
- 参考已有封面的手法：深色渐变底 + 半透明彩色光斑/几何图形 + 左侧主色竖条 + 分类胶囊 + 标题 + 页脚 `survivorff / me.frankfu.cloud`。每篇换配色和图形概念。
- `scripts/gen-covers.mjs` 是**模板化应急兜底**，不符合"每篇新设计"标准，除非临时缺图别用它。

## 5. 发布流程（标准动作）

1. 写文章，`draft: true`，**先给作者过目**。
2. 作者说"可以发" → 为这篇**单独设计封面** → 渲染 PNG → 改 `draft: false`。
3. `pnpm build` 本地验证（报错先清缓存重试）。
4. `git add <md> <cover.png>` → `git commit` → `git push`。
5. CI 自动部署，几分钟后 me.frankfu.cloud 生效（CDN 有缓存，刷不出用 Cmd+Shift+R）。

## 6. 写作风格（作者的声音）

- 第一人称、慢、诚实、不端着、敢承认笨拙和焦虑。不写流量标题，不硬凑字数。
- **有真实素材才写**：写书评先确认作者真读过（可查微信读书数据，见 `books-triage/`）；没读过就不写代笔读后感。
- **结合当下实时**：涉及数据/时事时用 web 搜索找真实锚点，带出处链接、转述（勿逐字大段照抄）。
- **不泄露隐私/内部**：不写东家项目细节、不暴露私密仓库结构、涉及"逆向/白嫖"等敏感表述改成中性说法。
- 版权：不用未授权的press/明星照片当配图，用原创设计。

## 7. 三个正在连载的 log 系列

- **副业 log**：`*-side-hustle-log-NN-*.md`，已到 #06。结构：本期一句话/做了什么/学到/数据/下一步。
- **英语 log**：#00 是 `2026-05-29-picking-up-english-again.md`，#01 起用 `*-english-log-NN-*.md`。
- **周记**：`*-weekly-log-NN-*.md`，#01 起（2026-09-06）。每周日结账，记生活/状态/习惯/主业副业进展，category 用 `生活`。
- 有节奏提醒 hook（副业 >14 天、英语 >30 天没更会提醒）——见工作区 `.kiro/`。
- 系列文章之间用 `/posts/<slug>/` 互相内链。

## 8. 评论系统

- Giscus（GitHub Discussions），配置在 `src/config.ts` 的 `commentConfig`，组件 `src/components/Comments.astro`，已挂在 `src/pages/posts/[...slug].astro`。
- 已启用、giscus app 已装、Announcements 分类、按 pathname 映射、跟随明暗主题、兼容 Swup 换页。
- 局限：评论需 GitHub 登录。若要对非技术朋友零门槛，可换 Waline（需部署后端）。

## 9. 私密工作区（不进版本库）

- `books-triage/`：微信读书 700+ 本书的整理数据（raw JSON、triage 表），已 gitignore。脚本在 `scripts/books-triage/`。
- `draft/`：草稿箱。

## 10. 关键约定速查

| 事项 | 约定 |
|------|------|
| 包管理 | pnpm |
| Node | 22+ |
| 部署 | push main → GitHub Actions |
| 本地 build 报错 | 清 `node_modules/.vite .astro dist` 重试 |
| 标题含 `#`/`:`/`"` | frontmatter 必须加引号 |
| 封面 | 每篇单独设计，作者真图优先 |
| 发布前 | draft:true 先过目 |
| 内容边界 | 生活向；不泄隐私；守版权；有真素材才写 |
