import type {
	CommentConfig,
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "survivorff",
	subtitle: "生活 · 读书 · 旅行 · 音乐 · 美食 · 体育",
	lang: "zh_CN",
	themeColor: {
		hue: 200, // teal-ish，区别于技术博客的冷色
		fixed: false,
	},
	banner: {
		enable: true,
		src: "assets/images/banner.jpg",
		position: "center",
		credit: {
			enable: true,
			text: "千岛湖，杭州",
			url: "",
		},
	},
	toc: {
		enable: true,
		depth: 2,
	},
	favicon: [],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.About,
		{
			name: "技术博客",
			url: "https://blog.frankfu.cloud",
			external: true,
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "assets/images/avatar.jpg",
	name: "survivorff",
	bio: "杭州 · 交易所工程师。白天写代码，其余时间读书、跑步、听歌、看球、做饭。",
	links: [
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/survivorff",
		},
		{
			name: "Twitter",
			icon: "fa6-brands:x-twitter",
			url: "https://twitter.com/survivorff",
		},
		{
			name: "Blog",
			icon: "fa6-solid:terminal",
			url: "https://blog.frankfu.cloud",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	theme: "github-dark",
};

export const commentConfig: CommentConfig = {
	enable: true,
	giscus: {
		repo: "survivorff/me",
		repoId: "R_kgDOSYyd6g",
		category: "Announcements",
		categoryId: "DIC_kwDOSYyd6s4C8rvb",
		mapping: "pathname",
		strict: true,
		reactionsEnabled: true,
		emitMetadata: false,
		inputPosition: "top",
		lang: "zh-CN",
	},
};
