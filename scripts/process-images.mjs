/**
 * One-off script to process uploaded avatar + banner into the right sizes/formats.
 * Reads from /tmp/fuwari-avatar.jpeg + /tmp/fuwari-banner.jpeg.
 * Writes to src/assets/images/.
 */
import sharp from "sharp";
import fs from "node:fs/promises";

const AVATAR_IN = "/tmp/fuwari-avatar.jpeg";
const BANNER_IN = "/tmp/fuwari-banner.jpeg";

const AVATAR_OUT = "src/assets/images/avatar.jpg";
const BANNER_OUT = "src/assets/images/banner.jpg";

async function processAvatar() {
	// Avatar: 4284x5712 portrait. Extract square ~center (slightly high to keep cat faces).
	// Take a 4000x4000 square starting from y=800 (skip upper 800px which is junk above the cats).
	// Then resize to 512x512.
	const meta = await sharp(AVATAR_IN).metadata();
	const size = Math.min(meta.width, meta.height - 800);
	const left = Math.floor((meta.width - size) / 2);
	const top = 800;

	await sharp(AVATAR_IN)
		.extract({ left, top, width: size, height: size })
		.resize(512, 512, { fit: "cover" })
		.jpeg({ quality: 88, mozjpeg: true })
		.toFile(AVATAR_OUT);

	const outMeta = await sharp(AVATAR_OUT).metadata();
	const stat = await fs.stat(AVATAR_OUT);
	console.log(
		`avatar: ${outMeta.width}x${outMeta.height} ${(stat.size / 1024).toFixed(1)} KB -> ${AVATAR_OUT}`,
	);
}

async function processBanner() {
	// Banner: 4032x3024 landscape. Crop to 16:9, resize to 1920x1080.
	await sharp(BANNER_IN)
		.resize(1920, 1080, { fit: "cover", position: "center" })
		.jpeg({ quality: 85, mozjpeg: true })
		.toFile(BANNER_OUT);

	const outMeta = await sharp(BANNER_OUT).metadata();
	const stat = await fs.stat(BANNER_OUT);
	console.log(
		`banner: ${outMeta.width}x${outMeta.height} ${(stat.size / 1024).toFixed(1)} KB -> ${BANNER_OUT}`,
	);
}

await processAvatar();
await processBanner();
