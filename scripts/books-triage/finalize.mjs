/**
 * Read triage-focus.md (user-edited tiers) + vault-auto.json (auto-vaulted),
 * emit the final tiered book lists.
 *
 * Outputs:
 *   books-triage/now.json      — ≤ 5 books you're reading this month
 *   books-triage/shelf.json    — queue of books to read next
 *   books-triage/vault.json    — everything else (searchable archive)
 *   books-triage/activated.csv — Now + Shelf flattened (feed into content)
 */
import fs from "node:fs";

const FOCUS_MD = "books-triage/triage-focus.md";
const VAULT_AUTO = "books-triage/vault-auto.json";
const OUT_NOW = "books-triage/now.json";
const OUT_SHELF = "books-triage/shelf.json";
const OUT_VAULT = "books-triage/vault.json";
const OUT_CSV = "books-triage/activated.csv";

if (!fs.existsSync(FOCUS_MD)) {
	console.error(`❌ Missing ${FOCUS_MD}. Run parse-weread.mjs first.`);
	process.exit(1);
}
if (!fs.existsSync(VAULT_AUTO)) {
	console.error(`❌ Missing ${VAULT_AUTO}. Run parse-weread.mjs first.`);
	process.exit(1);
}

const lines = fs.readFileSync(FOCUS_MD, "utf8").split("\n");

// Each section's table has a different column layout. Detect header to map fields.
let currentHeader = null;
const parsed = [];

for (const line of lines) {
	if (!line.startsWith("|")) {
		currentHeader = null;
		continue;
	}
	const cells = line.split("|").map((s) => s.trim());
	// leading & trailing blank cells from |…|…|
	if (cells.length > 0 && cells[0] === "") cells.shift();
	if (cells.length > 0 && cells[cells.length - 1] === "") cells.pop();

	if (cells.includes("---")) continue;

	if (!currentHeader) {
		if (cells[0] === "#") {
			currentHeader = cells;
		}
		continue;
	}

	// data row
	if (cells.length !== currentHeader.length) continue;
	if (cells[0] === "#") {
		currentHeader = cells;
		continue;
	}

	const row = {};
	currentHeader.forEach((h, i) => (row[h] = cells[i]));
	parsed.push(row);
}

// normalize rows
const records = parsed.map((r) => ({
	tier: (r.tier || "").toUpperCase(),
	title: (r["书名"] || "").replace(/\\\|/g, "|"),
	author: (r["作者"] || "").replace(/\\\|/g, "|"),
	category: r["分类"] || "",
	chapterIdx: Number(r["章节"]) || 0,
	readingHours: Number(r["时长h"]) || 0,
	readUpdate: r["最近读"] || r["最近动过"] || "",
	source: r["来源"] || "",
}));

const now = records.filter((r) => r.tier === "N");
const shelf = records.filter((r) => r.tier === "S");
const vaultFromFocus = records.filter((r) => r.tier === "V");

// auto-vaulted books (never opened >180d)
const vaultAuto = JSON.parse(fs.readFileSync(VAULT_AUTO, "utf8"));

const vault = [
	...vaultFromFocus.map((r) => ({
		title: r.title,
		author: r.author,
		category: r.category,
		readingHours: r.readingHours,
		readUpdate: r.readUpdate,
		fromFocus: true,
	})),
	...vaultAuto.map((v) => ({ ...v, fromFocus: false })),
];

fs.writeFileSync(OUT_NOW, JSON.stringify(now, null, 2));
fs.writeFileSync(OUT_SHELF, JSON.stringify(shelf, null, 2));
fs.writeFileSync(OUT_VAULT, JSON.stringify(vault, null, 2));

// flatten Now + Shelf to CSV for future content import
const fields = ["tier", "title", "author", "category", "readingHours", "readUpdate"];
const csvEscape = (v) => {
	const s = String(v ?? "").replace(/"/g, '""');
	return /[",\n]/.test(s) ? `"${s}"` : s;
};
const csvRows = [
	fields.join(","),
	...[...now, ...shelf].map((r) => fields.map((f) => csvEscape(r[f])).join(",")),
];
fs.writeFileSync(OUT_CSV, csvRows.join("\n"));

console.log(`✅ Finalized tiers`);
console.log(`   🟢 Now:    ${now.length} books → ${OUT_NOW}`);
console.log(`   🟡 Shelf:  ${shelf.length} books → ${OUT_SHELF}`);
console.log(`   🗄️  Vault:  ${vault.length} books → ${OUT_VAULT}`);
console.log("");
console.log(`   Activated (Now+Shelf): ${OUT_CSV}`);

// warnings on quota
if (now.length > 5) {
	console.log("");
	console.log(`   ⚠ Now 有 ${now.length} 本，建议 ≤ 5。考虑把部分降级到 Shelf。`);
}
if (shelf.length > 30) {
	console.log("");
	console.log(`   ⚠ Shelf 有 ${shelf.length} 本，建议 ≤ 30。超过部分可能沦为"囤书"。`);
}
