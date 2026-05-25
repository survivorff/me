# 书架三步整理（私密工作区）

这个目录不进版本库。所有原始数据只在本地。

## 流程

1. **抓取**：从 weread.qq.com 导出书架 JSON → 落到 `raw/shelf.json`
2. **解析**：`node scripts/books-triage/parse-weread.mjs` → 产出 `triage.csv` + `triage.md`
3. **断舍离**：在 `triage.md` 上标 keep/drop/maybe，决定哪些进博客书架

## 产物

- `raw/shelf.json` — 原始抓取数据（可能 1-5 MB）
- `triage.csv` — 扁平表格，丢 Excel/Numbers 里做筛选
- `triage.md` — Markdown 表格，带勾选框，适合直接在编辑器里标记

所有产物都被 `.gitignore` 排除。确认方法：`git status` 应该看不到它们。
