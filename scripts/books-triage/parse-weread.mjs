/**
 * Parse raw weread shelf JSON into tiered triage files.
 *
 * Input:  books-triage/raw/shelf.json  (from weread.qq.com /web/shelf/sync)
 *
 * Outputs:
 *   books-triage/triage.csv        — full table, everyone, for reference
 *   books-triage/triage-full.md    — full markdown, 788 books
 *   books-triage/triage-focus.md   — ~88 "alive" books, user edits this
 *   books-triage/vault-auto.json   — 700 untouched books, auto-assigned to Vault
 *
 * Tier model:
 *   N = Now    — reading this month (≤ 5 books is ideal)
 *   S = Shelf  — want to read soon (≤ 30 books is ideal)
 *   V = Vault  — dormant archive, searchable, no active attention
 *
 * Pre-filled defaults in triage-focus.md:
 *   proposed=reading → N  (currently reading; confirm)
 *   proposed=stalled → S  (revive them by default)
 *   proposed=maybe   → S  (recently added; shelf queue)
 *   proposed=read    → V  (finished, default to vault; upgrade to S if re-read)
 *   proposed=drop?   → V  (auto, not shown in focus)
 *
 * User only edits triage-focus.md, changing individual N/S/V letters if needed.
 */

import fs from "node:fs";

const INPUT = "books-triage/raw/shelf.json";
const OUT_CSV = "books-triage/triage.csv";
const OUT_FULL_MD = "books-triage/triage-full.md";
const OUT_FOCUS_MD = "books-triage/triage-focus.md";
const OUT_VAULT_JSON = "books-triage/vault-auto.json";

if (!fs.existsSync(INPUT)) {
	console.error(`❌ Missing ${INPUT}`);
	process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(INPUT, "utf8"));
const booksArr = Array.isArray(raw.books) ? raw.books : [];
const progressArr = Array.isArray(raw.bookProgress) ? raw.bookProgress : [];
const archiveArr = Array.isArray(raw.archive) ? raw.archive : [];

if (booksArr.length === 0) {
	console.error("❌ shelf.json has no `books[]`. Wrong endpoint?");
	process.exit(2);
}

const progressById = new Map();
for (const p of progressArr) {
	if (p.bookId) progressById.set(String(p.bookId), p);
}
const folderById = new Map();
for (const a of archiveArr) {
	for (const id of a.bookIds || []) folderById.set(String(id), a.name || "");
}

const toDate = (v) => {
	if (!v) return "";
	const n = typeof v === "number" ? v : Number(v);
	if (!Number.isFinite(n) || n <= 0) return "";
	const ms = n < 2e10 ? n * 1000 : n;
	return new Date(ms).toISOString().slice(0, 10);
};

const SEC_PER_DAY = 86400;
const nowSec = Math.floor(Date.now() / 1000);

const norm = booksArr.map((b) => {
	const id = String(b.bookId || "");
	const p = progressById.get(id) || {};
	const reachedEnd = p.progress === 1;
	const readingTime = p.readingTime || 0;
	const lastRead = p.updateTime || b.readUpdateTime || 0;
	const daysSince = lastRead ? Math.floor((nowSec - lastRead) / SEC_PER_DAY) : 9999;

	return {
		bookId: id,
		title: b.title || "",
		author: b.author || "",
		category: b.category || "",
		folder: folderById.get(id) || "",
		finishMarked: b.finishReading === 1,
		reachedEnd,
		chapterIdx: p.chapterIdx || 0,
		readingTime,
		readingHours: Math.round((readingTime / 3600) * 10) / 10,
		readUpdate: toDate(lastRead),
		shelfUpdate: toDate(b.updateTime),
		daysSince,
		cover: b.cover || "",
	};
});

for (const b of norm) {
	const touched = b.readingTime >= 300;
	const done = b.finishMarked || b.reachedEnd;

	if (done) b.proposed = "read";
	else if (touched && b.daysSince < 60) b.proposed = "reading";
	else if (touched && b.daysSince < 365) b.proposed = "stalled";
	else if (!touched && b.daysSince < 180) b.proposed = "maybe";
	else b.proposed = "drop?";
}

// Default tier per proposed state
const defaultTier = (proposed) => {
	switch (proposed) {
		case "reading":
			return "N";
		case "stalled":
			return "S";
		case "maybe":
			return "S";
		case "read":
			return "V"; // finished → archive by default; user can upgrade to S
		default:
			return "V"; // drop? → vault
	}
};
for (const b of norm) b.tier = defaultTier(b.proposed);

// --- full CSV (for reference / spreadsheet) ---
const csvFields = [
	"tier",
	"proposed",
	"title",
	"author",
	"category",
	"folder",
	"finishMarked",
	"reachedEnd",
	"chapterIdx",
	"readingHours",
	"readUpdate",
	"bookId",
];
const csvEscape = (v) => {
	const s = String(v ?? "").replace(/"/g, '""');
	return /[",\n]/.test(s) ? `"${s}"` : s;
};
const csvRows = [
	csvFields.join(","),
	...norm.map((b) => csvFields.map((f) => csvEscape(b[f])).join(",")),
];
fs.writeFileSync(OUT_CSV, csvRows.join("\n"));

// --- full markdown ---
const mdEscape = (s) => String(s || "").replace(/\|/g, "\\|");
const counts = norm.reduce((acc, b) => {
	acc[b.proposed] = (acc[b.proposed] || 0) + 1;
	return acc;
}, {});
const totalHours = Math.round(norm.reduce((s, b) => s + b.readingHours, 0));

const fullLines = [
	"# 微信读书 · 全部书单（参考）",
	"",
	`生成于 ${new Date().toISOString().slice(0, 16).replace("T", " ")}`,
	`共 **${norm.length}** 本，排序：在读 → 读完 → 搁置 → 可能 → 建议放手。`,
	"",
	"> 这份是参考。**请到 `triage-focus.md` 做标记**，那里只列 ~88 本活着的书。",
	"",
	"## 统计",
	"",
	`- 读完 (read):    ${counts.read || 0}`,
	`- 在读 (reading): ${counts.reading || 0}`,
	`- 搁置 (stalled): ${counts.stalled || 0}`,
	`- 可能 (maybe):   ${counts.maybe || 0}`,
	`- 放手 (drop?):   ${counts["drop?"] || 0}`,
	`- 累计阅读:       ${totalHours} 小时`,
	"",
	"| # | tier | 建议 | 书名 | 作者 | 分类 | 章节 | 时长h | 最近读 |",
	"|---|---|---|---|---|---|---|---|---|",
];
const rankFull = { reading: 0, read: 1, stalled: 2, maybe: 3, "drop?": 4 };
const sortedFull = [...norm].sort((a, b) => {
	const r = (rankFull[a.proposed] ?? 9) - (rankFull[b.proposed] ?? 9);
	if (r !== 0) return r;
	return (b.readUpdate || "").localeCompare(a.readUpdate || "");
});
sortedFull.forEach((b, i) => {
	fullLines.push(
		`| ${i + 1} | ${b.tier} | ${b.proposed} | ${mdEscape(b.title)} | ${mdEscape(b.author).slice(0, 24)} | ${b.category.slice(0, 18)} | ${b.chapterIdx || ""} | ${b.readingHours || ""} | ${b.readUpdate || ""} |`,
	);
});
fs.writeFileSync(OUT_FULL_MD, fullLines.join("\n"));

// --- focus markdown ---
// Section 1: 在读 (N default)
// Section 2: 搁置 + 可能 (S default)
// Section 3: 读完 (V default, but S if you want to re-read)
const nowBooks = norm.filter((b) => b.proposed === "reading");
const shelfBooks = norm
	.filter((b) => b.proposed === "stalled" || b.proposed === "maybe")
	.sort((a, b) => (b.readUpdate || "").localeCompare(a.readUpdate || ""));
const readBooks = norm
	.filter((b) => b.proposed === "read")
	.sort((a, b) => (b.readUpdate || "").localeCompare(a.readUpdate || ""));

const focusCount = nowBooks.length + shelfBooks.length + readBooks.length;
const vaultAutoCount = norm.length - focusCount;

const focusLines = [
	"# 微信读书 · 聚焦整理",
	"",
	`生成于 ${new Date().toISOString().slice(0, 16).replace("T", " ")}`,
	"",
	`共 **${norm.length}** 本。其中 **${focusCount}** 本还活着需要你看一眼，**${vaultAutoCount}** 本已自动进 Vault。`,
	"",
	"## Tier 含义",
	"",
	"- `N` = **Now** 这个月真在读，目标 ≤ 5 本",
	"- `S` = **Shelf** 下半年想读的队列，目标 ≤ 30 本",
	"- `V` = **Vault** 仓库（看不见但搜得到，随时可以从 Vault 升级回 S）",
	"",
	"## 怎么用",
	"",
	"1. 每本书的 `tier` 列已经预填了我的建议",
	"2. 你只需要**扫一遍**，把不同意的字母改一下（大写 `N`/`S`/`V`）",
	"3. 完全不动也行——默认就够用。真正要看的是：",
	"   - N 区有没有不该在 Now 的（改成 S 或 V）",
	"   - R 区有没有想重读的（改成 S）",
	"4. 保存后跑 `node scripts/books-triage/finalize.mjs`",
	"",
	"---",
	"",
	`## 🟢 Now 候选 · ${nowBooks.length} 本（近 60 天在读）`,
	"",
	"这些是你**最近真的在读**的书。看一下是否真的要放进 Now。",
	"",
	"| # | tier | 书名 | 作者 | 分类 | 章节 | 时长h | 最近读 |",
	"|---|---|---|---|---|---|---|---|",
];
nowBooks.forEach((b, i) => {
	focusLines.push(
		`| ${i + 1} | ${b.tier} | ${mdEscape(b.title)} | ${mdEscape(b.author).slice(0, 24)} | ${b.category.slice(0, 18)} | ${b.chapterIdx || ""} | ${b.readingHours || ""} | ${b.readUpdate || ""} |`,
	);
});

focusLines.push(
	"",
	`## 🟡 Shelf 候选 · ${shelfBooks.length} 本（搁置 + 可能）`,
	"",
	"曾经真的翻开过（搁置）或近半年加入书架的（可能）。默认都进 Shelf——",
	"**觉得已经不想读的改成 `V`**，觉得想立刻重启的改成 `N`。",
	"",
	"| # | tier | 来源 | 书名 | 作者 | 分类 | 章节 | 时长h | 最近动过 |",
	"|---|---|---|---|---|---|---|---|---|",
);
shelfBooks.forEach((b, i) => {
	focusLines.push(
		`| ${i + 1} | ${b.tier} | ${b.proposed === "stalled" ? "搁置" : "可能"} | ${mdEscape(b.title)} | ${mdEscape(b.author).slice(0, 24)} | ${b.category.slice(0, 18)} | ${b.chapterIdx || ""} | ${b.readingHours || ""} | ${b.readUpdate || ""} |`,
	);
});

focusLines.push(
	"",
	`## ⚪ 读完的 · ${readBooks.length} 本（默认进 Vault 归档）`,
	"",
	'微信标过"读完"或你读到了最后一章。默认归档到 Vault——',
	"**想重读、或想在博客里展示的，改成 `S`**。",
	"（改成 S 的书会出现在博客书架，默认进 Vault 的只保留元数据、搜得到但不展示。）",
	"",
	"| # | tier | 书名 | 作者 | 分类 | 章节 | 时长h | 最近读 |",
	"|---|---|---|---|---|---|---|---|",
);
readBooks.forEach((b, i) => {
	focusLines.push(
		`| ${i + 1} | ${b.tier} | ${mdEscape(b.title)} | ${mdEscape(b.author).slice(0, 24)} | ${b.category.slice(0, 18)} | ${b.chapterIdx || ""} | ${b.readingHours || ""} | ${b.readUpdate || ""} |`,
	);
});

focusLines.push(
	"",
	"---",
	"",
	`## 🗄️ 自动 Vault · ${vaultAutoCount} 本`,
	"",
	"收藏 >180 天从未真正翻开（<5min）的书——默认全部归档，看 `vault-auto.json`。",
	"将来在 Vault 里搜索 → 发现想读的 → 在下一轮整理里捞出来进 S。",
	"",
);

fs.writeFileSync(OUT_FOCUS_MD, focusLines.join("\n"));

// --- vault auto JSON ---
const vaultAuto = norm
	.filter((b) => b.proposed === "drop?")
	.map((b) => ({
		bookId: b.bookId,
		title: b.title,
		author: b.author,
		category: b.category,
		folder: b.folder,
		readingHours: b.readingHours,
		readUpdate: b.readUpdate,
	}));
fs.writeFileSync(OUT_VAULT_JSON, JSON.stringify(vaultAuto, null, 2));

// --- console summary ---
console.log(`✅ Parsed ${norm.length} books`);
console.log("");
console.log(`   聚焦 (focus): ${focusCount} 本 → 你标 ${OUT_FOCUS_MD}`);
console.log(`     🟢 Now 候选:  ${nowBooks.length} 本 (默认 N)`);
console.log(`     🟡 Shelf 候选: ${shelfBooks.length} 本 (默认 S)`);
console.log(`     ⚪ 读完的:    ${readBooks.length} 本 (默认 V)`);
console.log("");
console.log(`   自动 Vault:   ${vaultAutoCount} 本 → ${OUT_VAULT_JSON}`);
console.log(`   累计阅读:     ${totalHours} 小时`);
console.log("");
console.log(`   下一步: 打开 ${OUT_FOCUS_MD}，扫一遍，改几个字母，保存。`);
console.log(`          然后: node scripts/books-triage/finalize.mjs`);
