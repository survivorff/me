/**
 * 自动封面生成器（兜底）。
 *
 * 逻辑：
 *   - 扫描 src/content/posts/*.md
 *   - 已经有手动封面（image 非空）的 → 跳过（尊重你给的真实图）
 *   - 没有封面的 → 生成一张「独一无二」的文字封面 PNG，落在文章同目录，
 *     并把 frontmatter 的 image 指向它
 *
 * 设计：
 *   - 统一家族：深色渐变 + 左侧主色竖条 + 分类标签 + 大号淡化汉字水印 + 站点页脚
 *   - 每篇不同：色相、渐变角度、背景纹理(点/斜线/网格/同心圆)都由 slug 派生
 *   - 不用 emoji（resvg 渲染不可靠），用 CJK 汉字 + 几何纹理，CI 无需字体
 *     （PNG 本地生成好直接提交，构建环境不参与渲染）
 *
 * 用法：
 *   node scripts/gen-covers.mjs            # 给所有缺封面的文章生成
 *   node scripts/gen-covers.mjs --force    # 重新生成所有自动封面（覆盖）
 *   node scripts/gen-covers.mjs <file.md>  # 只处理指定文章
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const POSTS_DIR = "src/content/posts";
const COVER_SUFFIX = "-cover.png";

const args = process.argv.slice(2);
const force = args.includes("--force");
const onlyFile = args.find((a) => a.endsWith(".md"));

// slug → 稳定 hash
function hash(str) {
	let h = 2166136261;
	for (let i = 0; i < str.length; i++) {
		h ^= str.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return Math.abs(h);
}

function esc(s) {
	return String(s)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
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

// 背景纹理（faint），4 选 1
function pattern(kind, color) {
	const o = 0.05;
	if (kind === 0) {
		// 点阵
		return `<pattern id="pat" width="48" height="48" patternUnits="userSpaceOnUse">
      <circle cx="6" cy="6" r="3" fill="${color}" opacity="${o}"/>
    </pattern>`;
	}
	if (kind === 1) {
		// 斜线
		return `<pattern id="pat" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="3" height="40" fill="${color}" opacity="${o}"/>
    </pattern>`;
	}
	if (kind === 2) {
		// 网格
		return `<pattern id="pat" width="56" height="56" patternUnits="userSpaceOnUse">
      <path d="M56 0H0V56" fill="none" stroke="${color}" stroke-width="2" opacity="${o}"/>
    </pattern>`;
	}
	// 同心圆
	return `<pattern id="pat" width="120" height="120" patternUnits="userSpaceOnUse">
      <circle cx="60" cy="60" r="50" fill="none" stroke="${color}" stroke-width="2" opacity="${o}"/>
      <circle cx="60" cy="60" r="30" fill="none" stroke="${color}" stroke-width="2" opacity="${o}"/>
    </pattern>`;
}

function makeSVG({ title, category, slug }) {
	const W = 1200;
	const H = 630;
	const seed = hash(slug);

	// 色相在 teal 家族里浮动：180~224
	const hue = 180 + (seed % 6) * 9; // 180,189,...,225
	const primary = `hsl(${hue}, 70%, 52%)`;
	const primaryDark = `hsl(${hue}, 65%, 38%)`;
	const bgTop = `hsl(${hue}, 32%, 15%)`;
	const bgBot = `hsl(${(hue + 8) % 360}, 38%, 9%)`;
	const angle = (seed % 3) * 30; // 渐变角度 0/30/60
	const patKind = seed % 4;
	const watermark = [...(category || "✦")][0] || "✦";

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

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" gradientTransform="rotate(${angle})">
      <stop offset="0%" stop-color="${bgTop}"/>
      <stop offset="100%" stop-color="${bgBot}"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${primary}"/>
      <stop offset="100%" stop-color="${primaryDark}"/>
    </linearGradient>
    ${pattern(patKind, primary)}
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#pat)"/>
  <text x="${W - 50}" y="${H - 20}" text-anchor="end" font-family="-apple-system, 'PingFang SC', 'Hiragino Sans GB', sans-serif" font-size="420" font-weight="900" opacity="0.06" fill="#ffffff">${esc(watermark)}</text>
  <rect x="62" y="${startY - 60}" width="8" height="${lines.length * lineHeight}" rx="4" fill="url(#accent)"/>
  <rect x="92" y="84" width="${catW}" height="58" rx="29" fill="${primary}" opacity="0.16"/>
  <text x="${92 + catW / 2}" y="123" text-anchor="middle" font-family="-apple-system, 'PingFang SC', 'Hiragino Sans GB', sans-serif" font-size="32" font-weight="700" fill="${primary}">${esc(category)}</text>
  ${titleText}
  <text x="92" y="${H - 54}" font-family="-apple-system, 'PingFang SC', sans-serif" font-size="30" font-weight="600" fill="#ffffff" opacity="0.85">survivorff</text>
  <text x="92" y="${H - 22}" font-family="-apple-system, 'PingFang SC', sans-serif" font-size="23" fill="#ffffff" opacity="0.42">me.frankfu.cloud · 生活 · 读书 · 副业 · 慢思考</text>
</svg>`;
}

// 极简 frontmatter 读取
function parseFront(raw) {
	const m = raw.match(/^---\n([\s\S]*?)\n---/);
	if (!m) return null;
	const fm = m[1];
	const get = (key) => {
		const line = fm.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
		if (!line) return "";
		let v = line[1].trim();
		if (
			(v.startsWith('"') && v.endsWith('"')) ||
			(v.startsWith("'") && v.endsWith("'"))
		)
			v = v.slice(1, -1);
		return v;
	};
	return { title: get("title"), category: get("category"), image: get("image") };
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
	if (hasManual && !force) {
		skipped++;
		continue; // 尊重手动封面
	}

	const isAuto = fm.image.endsWith(COVER_SUFFIX);
	if (isAuto && !force) {
		skipped++;
		continue; // 已有自动封面，非 --force 不重生成
	}

	const svg = makeSVG({ title: fm.title, category: fm.category || "随笔", slug: base });
	const png = await sharp(Buffer.from(svg)).png().toFile(coverPath);
	void png;

	// 写回 frontmatter 的 image
	const newRaw = raw.replace(/^image:\s*.*$/m, `image: "./${coverName}"`);
	fs.writeFileSync(file, newRaw);

	console.log(`✓ ${base}  →  ${coverName}`);
	generated++;
}

console.log(`\n生成 ${generated} 张，跳过 ${skipped} 篇（已有封面）。`);
