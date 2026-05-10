/**
 * Create a new post with category-aware template.
 *
 * Usage:
 *   pnpm new-post <slug>                      # default 生活 template
 *   pnpm new-post <slug> --cat 读书            # pick a template
 *   pnpm new-post <slug> --cat 旅行            # 读书 | 旅行 | 健康 | 兴趣 | 生活
 */
import fs from "node:fs";
import path from "node:path";

function getDate() {
	const d = new Date();
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${y}-${m}-${day}`;
}

const args = process.argv.slice(2);

if (args.length === 0) {
	console.error(`Error: No filename argument provided
Usage: pnpm new-post <slug> [--cat <读书|旅行|健康|兴趣|生活>]`);
	process.exit(1);
}

let fileName = args[0];
let category = "生活";

for (let i = 1; i < args.length; i++) {
	if (args[i] === "--cat" && args[i + 1]) {
		category = args[i + 1];
		i++;
	}
}

if (!/\.(md|mdx)$/i.test(fileName)) {
	fileName += ".md";
}

const targetDir = "./src/content/posts/";
const fullPath = path.join(targetDir, fileName);

if (fs.existsSync(fullPath)) {
	console.error(`Error: File ${fullPath} already exists`);
	process.exit(1);
}

const dirPath = path.dirname(fullPath);
if (!fs.existsSync(dirPath)) {
	fs.mkdirSync(dirPath, { recursive: true });
}

const title = args[0].replace(/\.(md|mdx)$/i, "").replace(/-/g, " ");

const templates = {
	读书: `---
title: ${title}
published: ${getDate()}
description: ''
image: ''
tags: [读书]
category: 读书
draft: true
---

## 书名和一句话

- 书名：《》
- 作者：
- 评分：★★★★☆（5 星制）
- 一句话评：

## 为什么读这本

## 印象最深的一段

> 引用一段原文

## 我的理解

## 推荐给谁

## 不推荐给谁
`,

	旅行: `---
title: ${title}
published: ${getDate()}
description: ''
image: ''
tags: [旅行]
category: 旅行
draft: true
---

## 行程

- 目的地：
- 时间：
- 天数：
- 交通：

## 最打动我的瞬间

## 吃

## 住

## 玩

## 如果重来一次

## 图
`,

	健康: `---
title: ${title}
published: ${getDate()}
description: ''
image: ''
tags: [跑步]
category: 健康
draft: true
---

## 本月数据

- 跑量：xx km
- 次数：xx 次
- 平均配速：x'xx"
- 最长一次：xx km

## 身体感受

## 做对了什么

## 做错了什么

## 下月目标
`,

	兴趣: `---
title: ${title}
published: ${getDate()}
description: ''
image: ''
tags: []
category: 兴趣
draft: true
---

<!--
  根据兴趣补 tags：[音乐] / [体育] / [美食] / [预测] / [AI] / [游戏] / [影视]
-->

## 这篇想记什么

## 具体的东西

## 我的感受

## 一句话总结
`,

	生活: `---
title: ${title}
published: ${getDate()}
description: ''
image: ''
tags: [随想]
category: 生活
draft: true
---

## 

`,
};

const content = templates[category] || templates["生活"];

fs.writeFileSync(fullPath, content);

console.log(`✅ Created ${fullPath} (category: ${category})`);
console.log(`   edit it, set draft: false when ready to publish.`);
