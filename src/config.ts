import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "survivorff",
	subtitle: "生活 · 读书 · 旅行 · 健康 · 兴趣",
	lang: "zh_CN",
	themeColor: {
		hue: 200, // teal-ish，区别于技术博客的冷色
		fixed: false,
	},
	banner: {
		enable: false,
		src: "assets/images/demo-banner.png",
		position: "center",
		credit: {
			enable: false,
			text: "",
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
	avatar: "assets/images/demo-avatar.png",
	name: "survivorff",
	bio: "交易所工程师。白天写代码，其余时间读书、跑步、旅行。",
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
