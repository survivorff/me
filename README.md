# me

survivorff 的个人 blog — 生活、读书、旅行、健康、兴趣。

🔗 [me.frankfu.cloud](https://me.frankfu.cloud)

技术博客在隔壁：[blog.frankfu.cloud](https://blog.frankfu.cloud)

基于 [Fuwari](https://github.com/saicaca/fuwari)（Astro + Tailwind + Svelte）。

## 本地开发

```bash
pnpm install
pnpm dev
```

本地 `http://localhost:4321`

## 写新文章

```bash
# 默认（生活）
pnpm new-post 2026-05-20-some-slug

# 指定分类（模板会不一样）
pnpm new-post 2026-05-20-some-book --cat 读书
pnpm new-post 2026-05-20-hangzhou --cat 旅行
pnpm new-post 2026-05-20-may-running --cat 健康
pnpm new-post 2026-05-20-album-xyz --cat 兴趣
```

产出 `src/content/posts/<slug>.md`。写好之后把 `draft: true` 改成 `false` 就会被正式收录。

## 分类和标签

一级分类（`category`）只能选一个：

- 📚 **读书** — 书评、读书笔记
- ✈️ **旅行** — 行程、城市、图文
- 🏃 **健康** — 跑步、身体数据、习惯
- 🎵 **兴趣** — 音乐、体育、美食、预测、AI、游戏、影视
- 💭 **生活** — 随想、年终总结

`tags` 可以自由加，细化分类。详见 [`CONTENT_PLAN.md`](./CONTENT_PLAN.md)。

## 目录

```
me/
├── src/
│   ├── config.ts              # 站点配置
│   ├── assets/images/         # avatar.jpg, banner.jpg
│   ├── content/
│   │   ├── posts/             # 所有文章
│   │   └── spec/about.md      # 关于页内容
│   └── ...
├── templates/                 # 各分类的写作模板（不会被收录）
│   ├── reading.md
│   ├── travel.md
│   ├── health.md
│   ├── hobby.md
│   └── life.md
├── scripts/
│   ├── new-post.js            # pnpm new-post 背后的脚本
│   └── process-images.mjs     # 一次性头像 / banner 处理
├── public/CNAME               # me.frankfu.cloud
├── .github/workflows/deploy.yml
├── CONTENT_PLAN.md            # 写作原则
└── README.md
```

## 部署

Push 到 `main` → GitHub Actions → GitHub Pages。

一次性配置（已完成）：
- Pages 设为 `GitHub Actions` 模式
- Pages 自定义域名 `me.frankfu.cloud`
- DNS：`me.frankfu.cloud` → `survivorff.github.io`

## 图片处理

第一次处理 avatar / banner 时用 `scripts/process-images.mjs`：

```bash
# 源图放这两个位置
/tmp/fuwari-avatar.jpeg
/tmp/fuwari-banner.jpeg

node scripts/process-images.mjs
# 产出 src/assets/images/avatar.jpg (512x512)
# 产出 src/assets/images/banner.jpg (1920x1080)
```

## 技术栈

- [Astro 5](https://astro.build/)
- [Fuwari](https://github.com/saicaca/fuwari) 主题
- [Tailwind CSS 3](https://tailwindcss.com/)
- [Pagefind](https://pagefind.app/) 全文搜索

## License

- 主题代码：MIT（Fuwari 上游）
- 文章内容：[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)
