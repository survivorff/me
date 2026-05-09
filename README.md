# me

survivorff 的个人 blog，记录读书、旅行、健康、兴趣、生活。

🔗 [me.frankfu.cloud](https://me.frankfu.cloud)

技术博客在另一个仓库：[blog.frankfu.cloud](https://blog.frankfu.cloud)

基于 [Fuwari](https://github.com/saicaca/fuwari) 主题（Astro + Tailwind）。

## 本地开发

```bash
pnpm install
pnpm dev
```

访问 `http://localhost:4321`

## 写作

新建一篇：

```bash
pnpm new-post my-post-slug
```

产出 `src/content/posts/my-post-slug.md`。Frontmatter 示例：

```yaml
---
title: 文章标题
published: 2026-05-09
description: 文章摘要
image: ''            # 可选封面图
tags: [读书, 随想]
category: 读书       # 单选一个主分类
draft: false
---
```

## 分类约定

一级分类（`category`）保持克制，选一个：

- `读书` — 书评、读书笔记
- `旅行` — 行程、城市、图文
- `健康` — 跑步、习惯、身体数据
- `兴趣` — 游戏、音乐、电影、咖啡
- `生活` — 随想、年终总结

`tags` 可以自由加，用来细分。

## 部署

push 到 `main` → GitHub Actions → GitHub Pages。

一次性需要做的事：

1. 仓库 Settings → Pages → Source: `GitHub Actions`
2. DNS：把 `me.frankfu.cloud` CNAME 到 `<github-user>.github.io`
3. `public/CNAME` 已经预置了 `me.frankfu.cloud`

## 技术栈

- [Astro](https://astro.build/) 5
- [Fuwari](https://github.com/saicaca/fuwari) 主题
- [Tailwind CSS](https://tailwindcss.com/)
- [Pagefind](https://pagefind.app/) 全文搜索

## License

- 主题代码：MIT（来自 Fuwari）
- 文章内容：[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)
