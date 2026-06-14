/**
 * 自动封面生成器（兜底）。
 *
 * 逻辑：
 *   - 扫描 src/content/posts/*.md
 *   - 有手动封面（image 非空且不是 *-cover.png）→ 永远跳过（尊重你给的真实图）
 *   - 没封面 / 已是自动封面 → 生成「内容相关」的封面 PNG
 *
 * 设计（v2，告别单色）：
 *   - 按分类给一套「色彩家族」（多色），而非单一 teal
 *   - 多个半透明径向渐变光斑叠加，做出极光/弥散的色彩层次
 *   - 按标题/标签关键词画「专属图形」：星空轨道 / 电路 / 上升柱 / 字母 / 书页 / 涟漪
 *   - 左下暗角保证标题可读
 *   - 每篇按 slug 派生光斑位置与色相微扰，各不相同
 *   - PNG 本地预生成提交，CI 无需字体
 *
 * 用法：
 *   node scripts/gen-covers.mjs            # 给缺封面的文章生成
 *   node scripts/gen-covers.mjs --force    # 重新生成所有自动封面（不动手动图）
 *   node scripts/gen-covers.mjs <file.md>  # 只处理指定文章
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const POSTS_DIR = "src/content/posts";
const COVER_SUFFIX = "-cover.png";
const W = 1200;
const H = 630;

const args = process.argv.slice(2);
const force = args.includes("--force");
const onlyFile = args.find((a) => a.endsWith(".md"));

function hash(str) {
	let h = 2166136261;
	for (let i = 0; i < str.length; i++) {
		h ^= str.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return Math.abs(h);
}
function esc(s) {
	return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function wrap(title, maxPerLine) {
	const chars = [...title];
	const lines = [];
	let cur = "";
	for (const ch of chars) {
		cur += ch;
		if ([...cur].length >= maxPerLine) {
			lines.push(cur);
			cur = "";
		}
	}
	if (cur) lines.push(cur);
	return lines.slice(0, 3);
}

// 分类 → 色彩家族（深色基底 + 多个光斑色，均为 HSL hue）
const PALETTES = {
	思考: { base: [248, 38, 12], blobs: [262, 295, 200], name: "思" },
	读书: { base: [28, 40, 12], blobs: [32, 18, 46], name: "读" },
	副业: { base: [192, 40, 11], blobs: [172, 200, 150], name: "副" },
	兴趣: { base: [168, 42, 11], blobs: [156, 96, 184], name: "趣" },
	生活: { base: [344, 38, 12], blobs: [350, 22, 320], name: "活" },
	随笔: { base: [218, 36, 12], blobs: [212, 196, 250], name: "笔" },
};

// 关键词 → 专属图形（motif）。命中优先级从上到下。
function pickMotif(title, tags) {
	const hay = (title + " " + tags.join(" ")).toLowerCase();
	const has = (...ks) => ks.some((k) => hay.includes(k.toLowerCase()));
	if (has("宇宙", "命运", "外星", "星际", "揭秘", "predict")) return "cosmos";
	if (has("ai", "token", "科技", "必然", "时代")) return "circuit";
	if (has("副业", "套利", "项目", "复盘", "工程师")) return "growth";
	if (has("英语", "english", "学习", "语言")) return "letters";
	if (has("读书", "反脆弱", "塔勒布", "书")) return "pages";
	if (has("慢", "内心", "平静", "生活", "生日", "随想")) return "ripple";
	return "dots";
}

function motifSVG(kind, color, seed) {
	const o = 0.16;
	const acc = `hsl(${color}, 80%, 70%)`;
	const faint = `hsl(${color}, 70%, 75%)`;
	let s = "";
	if (kind === "cosmos") {
		// 星空 + 轨道环（右侧）
		const cx = 940;
		const cy = 300;
		for (const r of [120, 190, 260]) {
			s += `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * 0.62}" fill="none" stroke="${faint}" stroke-width="2" opacity="0.22" transform="rotate(-18 ${cx} ${cy})"/>`;
		}
		s += `<circle cx="${cx}" cy="${cy}" r="26" fill="${acc}" opacity="0.7"/>`;
		// 散星
		for (let i = 0; i < 40; i++) {
			const x = (hash(`${seed}x${i}`) % W);
			const y = (hash(`${seed}y${i}`) % H);
			const rr = 1 + (hash(`${seed}r${i}`) % 3);
			s += `<circle cx="${x}" cy="${y}" r="${rr}" fill="#fff" opacity="${0.2 + (hash(`${seed}o${i}`) % 50) / 100}"/>`;
		}
		return s;
	}
	if (kind === "circuit") {
		// 电路节点网格（右侧）
		for (let i = 0; i < 7; i++) {
			for (let j = 0; j < 5; j++) {
				const x = 700 + i * 70;
				const y = 90 + j * 110;
				if ((i + j + seed) % 3 === 0) continue;
				s += `<circle cx="${x}" cy="${y}" r="5" fill="${acc}" opacity="0.5"/>`;
				if (i < 6 && (i + seed) % 2 === 0)
					s += `<line x1="${x}" y1="${y}" x2="${x + 70}" y2="${y}" stroke="${faint}" stroke-width="2" opacity="0.25"/>`;
				if (j < 4 && (j + seed) % 2 === 1)
					s += `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + 110}" stroke="${faint}" stroke-width="2" opacity="0.25"/>`;
			}
		}
		return s;
	}
	if (kind === "growth") {
		// 上升柱状（右下）
		const bx = 720;
		const by = 520;
		const hs = [70, 130, 100, 180, 150, 240];
		hs.forEach((hh, i) => {
			s += `<rect x="${bx + i * 70}" y="${by - hh}" width="44" height="${hh}" rx="8" fill="${acc}" opacity="${0.25 + i * 0.06}"/>`;
		});
		s += `<path d="M${bx} ${by - 60} L${bx + 5 * 70 + 22} ${by - 250}" stroke="${faint}" stroke-width="4" opacity="0.4" stroke-linecap="round"/>`;
		s += `<path d="M${bx + 5 * 70 - 12} ${by - 250} l34 0 l0 34" fill="none" stroke="${faint}" stroke-width="4" opacity="0.4" stroke-linecap="round" stroke-linejoin="round"/>`;
		return s;
	}
	if (kind === "letters") {
		// 巨大半透明字母
		s += `<text x="900" y="440" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="420" font-weight="800" fill="${acc}" opacity="0.14">Aa</text>`;
		return s;
	}
	if (kind === "pages") {
		// 书页横线（右侧）
		for (let i = 0; i < 11; i++) {
			const y = 120 + i * 38;
			const w = 360 - (i % 3) * 60;
			s += `<rect x="720" y="${y}" width="${w}" height="8" rx="4" fill="${faint}" opacity="0.2"/>`;
		}
		return s;
	}
	if (kind === "ripple") {
		// 同心涟漪（右侧）
		const cx = 920;
		const cy = 320;
		for (const r of [60, 130, 200, 270]) {
			s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${faint}" stroke-width="3" opacity="${0.28 - r / 1400}"/>`;
		}
		s += `<circle cx="${cx}" cy="${cy}" r="22" fill="${acc}" opacity="0.6"/>`;
		return s;
	}
	// dots 默认
	for (let i = 0; i < 60; i++) {
		const x = hash(`${seed}dx${i}`) % W;
		const y = hash(`${seed}dy${i}`) % H;
		s += `<circle cx="${x}" cy="${y}" r="${2 + (hash(`${seed}dr${i}`) % 3)}" fill="${faint}" opacity="0.12"/>`;
	}
	return s;
}

function makeSVG({ title, category, tags, slug }) {
	const seed = hash(slug);
	const pal = PALETTES[category] || PALETTES["随笔"];
	const [bh, bs, bl] = pal.base;
	const hueJit = (seed % 7) - 3; // ±3 色相微扰，每篇略不同
	const bg1 = `hsl(${bh + hueJit}, ${bs}%, ${bl}%)`;
	const bg2 = `hsl(${(bh + 14 + hueJit + 360) % 360}, ${bs + 6}%, ${Math.max(6, bl - 5)}%)`;

	// 三个光斑色 + 位置（位置 seeded）
	const blobs = pal.blobs.map((hue, i) => {
		const px = 30 + (hash(`${seed}px${i}`) % 80); // 30~110 %
		const py = 10 + (hash(`${seed}py${i}`) % 80);
		const rad = 38 + (hash(`${seed}pr${i}`) % 26); // 38~64 %
		return { hue, px, py, rad, i };
	});

	const motif = pickMotif(title, tags);
	const motifHue = pal.blobs[0];

	const lines = wrap(title, 13);
	const lineHeight = 84;
	const startY = H / 2 - ((lines.length - 1) * lineHeight) / 2 + 6;
	const titleText = lines
		.map(
			(ln, i) =>
				`<text x="92" y="${startY + i * lineHeight}" font-family="-apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif" font-size="62" font-weight="800" fill="#ffffff" letter-spacing="1">${esc(ln)}</text>`,
		)
		.join("\n  ");

	const catW = [...category].length * 34 + 56;
	const primary = `hsl(${pal.blobs[0]}, 78%, 64%)`;

	const blobDefs = blobs
		.map(
			(b) =>
				`<radialGradient id="b${b.i}" cx="${b.px}%" cy="${b.py}%" r="${b.rad}%">
      <stop offset="0%" stop-color="hsl(${b.hue}, 85%, 60%)" stop-opacity="0.55"/>
      <stop offset="55%" stop-color="hsl(${b.hue}, 80%, 50%)" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="hsl(${b.hue}, 80%, 50%)" stop-opacity="0"/>
    </radialGradient>`,
		)
		.join("\n    ");
	const blobRects = blobs.map((b) => `<rect width="${W}" height="${H}" fill="url(#b${b.i})"/>`).join("\n  ");

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" gradientTransform="rotate(35)">
      <stop offset="0%" stop-color="${bg1}"/>
      <stop offset="100%" stop-color="${bg2}"/>
    </linearGradient>
    ${blobDefs}
    <linearGradient id="legibility" x1="0" y1="1" x2="0.7" y2="0">
      <stop offset="0%" stop-color="#000" stop-opacity="0.55"/>
      <stop offset="60%" stop-color="#000" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="hsl(${pal.blobs[0]}, 80%, 66%)"/>
      <stop offset="100%" stop-color="hsl(${pal.blobs[1]}, 75%, 50%)"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  ${blobRects}
  ${motifSVG(motif, motifHue, seed)}
  <rect width="${W}" height="${H}" fill="url(#legibility)"/>
  <text x="${W - 46}" y="${H - 26}" text-anchor="end" font-family="-apple-system, 'PingFang SC', 'Hiragino Sans GB', sans-serif" font-size="300" font-weight="900" opacity="0.05" fill="#ffffff">${esc(pal.name)}</text>
  <rect x="62" y="${startY - 60}" width="8" height="${lines.length * lineHeight}" rx="4" fill="url(#accent)"/>
  <rect x="92" y="84" width="${catW}" height="58" rx="29" fill="${primary}" opacity="0.22"/>
  <text x="${92 + catW / 2}" y="123" text-anchor="middle" font-family="-apple-system, 'PingFang SC', 'Hiragino Sans GB', sans-serif" font-size="32" font-weight="700" fill="#ffffff" opacity="0.92">${esc(category)}</text>
  ${titleText}
  <text x="92" y="${H - 54}" font-family="-apple-system, 'PingFang SC', sans-serif" font-size="30" font-weight="600" fill="#ffffff" opacity="0.9">survivorff</text>
  <text x="92" y="${H - 22}" font-family="-apple-system, 'PingFang SC', sans-serif" font-size="23" fill="#ffffff" opacity="0.5">me.frankfu.cloud · 生活 · 读书 · 副业 · 慢思考</text>
</svg>`;
}

function parseFront(raw) {
	const m = raw.match(/^---\n([\s\S]*?)\n---/);
	if (!m) return null;
	const fm = m[1];
	const get = (key) => {
		const line = fm.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
		if (!line) return "";
		let v = line[1].trim();
		if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
			v = v.slice(1, -1);
		return v;
	};
	const tagLine = fm.match(/^tags:\s*\[(.*)\]/m);
	const tags = tagLine
		? tagLine[1].split(",").map((t) => t.trim().replace(/^["']|["']$/g, "")).filter(Boolean)
		: [];
	return { title: get("title"), category: get("category"), image: get("image"), tags };
}

let files = fs
	.readdirSync(POSTS_DIR)
	.filter((f) => f.endsWith(".md"))
	.map((f) => path.join(POSTS_DIR, f));
if (onlyFile) files = files.filter((f) => f.endsWith(path.basename(onlyFile)));

let generated = 0;
let skipped = 0;

for (const file of files) {
	const raw = fs.readFileSync(file, "utf8");
	const fm = parseFront(raw);
	if (!fm) continue;

	const base = path.basename(file, ".md");
	const coverName = `${base}${COVER_SUFFIX}`;
	const coverPath = path.join(POSTS_DIR, coverName);

	const hasManual = fm.image && !fm.image.endsWith(COVER_SUFFIX);
	if (hasManual) {
		skipped++;
		continue; // 手动封面永远豁免，即便 --force
	}
	const isAuto = fm.image.endsWith(COVER_SUFFIX);
	if (isAuto && !force) {
		skipped++;
		continue;
	}

	const svg = makeSVG({
		title: fm.title,
		category: fm.category || "随笔",
		tags: fm.tags,
		slug: base,
	});
	await sharp(Buffer.from(svg)).png().toFile(coverPath);

	const newRaw = raw.replace(/^image:\s*.*$/m, `image: "./${coverName}"`);
	fs.writeFileSync(file, newRaw);
	console.log(`✓ ${base}  [${fm.category}/${pickMotif(fm.title, fm.tags)}]`);
	generated++;
}

console.log(`\n生成 ${generated} 张，跳过 ${skipped} 篇（手动图或未触发）。`);
