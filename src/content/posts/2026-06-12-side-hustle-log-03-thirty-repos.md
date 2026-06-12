---
title: 副业 log #03：用 AI 铺开的 30 多个项目，一次盘点
published: 2026-06-12
description: 接着 #02 往下记。最近几个月我借助 AI 铺开了三十多个项目——自媒体、产品、工具、知识库、博客都有。这一篇把它们摊在桌面上数一遍，顺便诚实地聊聊"广撒网"这件事的得与失。
image: ''
tags: [副业, log, AI, 项目, 复盘]
category: 副业
draft: false
---

[log #01](/posts/2026-05-12-side-hustle-log-01-why-now/) 想清楚为什么做，[log #02](/posts/2026-05-30-side-hustle-log-02-arbitrage-explore/) 记了第一个方向。这一篇 #03，我想把最近几个月铺开的东西，一次性摊在桌面上数一遍。

数完我自己都吓一跳——[我的 GitHub](https://github.com/survivorff) 上已经有 **30 多个**相关仓库了。绝大多数是借助 AI，在业余时间一个一个搭起来的。

这篇就当一次公开的盘点。不吹，如实标状态。

## 先把项目摊开

我按用途分了几类。状态如实标：✅ 已上线 / 🧪 测试中 / 🌱 摸索中 / 📚 知识库 / ⏸️ 还没启动。

### 自媒体

- ⏸️ **世界杯足球知识 · 小红书**——号还没起。世界杯刚开赛，这个窗口很短，做不做我这两天得决断
- 🌱 **AI / Web3 知识分享**——靠 [content-os](https://github.com/survivorff/content-os)（全平台内容分发）+ [web3-insider](https://github.com/survivorff/web3-insider) 在攒素材

### 产品

- ✅ **命理八字**——MVP 已上线（这个赛道我心里一直留着合规这根弦，走的是工具向不是算命服务向）
- 🧪 **预测市场套利工具** [predict_arbitrage](https://github.com/survivorff/predict_arbitrage)——本地测试中。**这个跟我本职最契合**，团队最近刚好在做[预测市场聚合器](https://github.com/survivorff/prediction_market_aggregator)，工作和副业在这里难得地重叠了
- 🧪 **世界杯预测工具**——本地测试中

### 工具

- ✅ **找工作雷达** [job-radar](https://github.com/survivorff/job-radar)——已完成发布、自己天天在用（[技术博客那篇](https://blog.frankfu.cloud/posts/job-radar-build/)写过它的设计）
- 🌱 **信息套利工具** [arbitrage_explore](https://github.com/survivorff/arbitrage_explore)——还在摸索，目前重心在搭认知框架

### 知识库（用 AI 帮自己系统学一个领域）

- 📚 [wallet_design](https://github.com/survivorff/wallet_design)——加密钱包
- 📚 [polymarket_research](https://github.com/survivorff/polymarket_research)——Polymarket 生态调研
- 📚 [hyperliquid_design](https://github.com/survivorff/hyperliquid_design)——Hyperliquid 永续产品
- 📚 [finance_wiki](https://github.com/survivorff/finance_wiki)——金融学习

### 兴趣爱好

- 📚 [guitar_design](https://github.com/survivorff/guitar_design)——吉他学习（正好生日收到一架 Casio，这个有了着落）
- 📚 [piano_design](https://github.com/survivorff/piano_design)——钢琴学习

### 博客

- ✅ **技术博客** [blog](https://github.com/survivorff/blog)——blog.frankfu.cloud，技术向
- ✅ **生活日志博客** [me](https://github.com/survivorff/me)——me.frankfu.cloud，你现在看的这个

### 其他还在本地跑的

[ai-stack](https://github.com/survivorff/ai-stack)（AI 工具栈）、[personal-os-hub](https://github.com/survivorff/personal-os-hub)（个人 agent 总线）、[claude-howto](https://github.com/survivorff/claude-howto)、[explore-notes](https://github.com/survivorff/explore-notes)、[world_history](https://github.com/survivorff/world_history)……还有一些没好意思列出来的半成品。

## 为什么要铺这么开

我知道"30 多个项目"听起来很不聚焦。但这背后是我想清楚的几件事。

**第一，我赌的是量变引起质变。** 我不指望每个都成。真实预期是——**100 个项目里能跑出 1-2 个，就很不错了**。剩下 98 个不是浪费，是为那 2 个交的学费。与其纠结"哪个会成"（我根本判断不出来），不如多播种，让概率和时间替我筛选。

**第二，每个项目都在帮我打磨 AI 工作流。** 做得越多，我越知道怎么跟 AI 协作：怎么拆任务、怎么写需求、怎么 review、什么该信什么该查。这套工作流本身，比任何单个项目都值钱。

**第三，亲手感受"杠杆"到底有多大。** 这些项目放在三年前，每一个的启动成本都高到让我直接放弃。现在我能同时推进几十个——这种"成本被 AI 压到地板上"的体感，光看文章是体会不到的，得自己干才知道。

**第四，为以后攒经验。** 我一直在想"超级个体 / 一人公司（OPC）"这件事。那种未来需要的能力——独立把一个想法从 0 跑到上线、自己搞定产品/技术/内容/分发——只能靠现在这样一个一个真刀真枪地练。这 30 个仓库，是我给那个未来交的训练费。

## 也得诚实说说问题

盘点不能只报喜。这么铺开，问题也很实在：

**不够聚焦。** 这是最大的隐患。30 个项目平摊注意力，每个都只推进了一点点，很可能最后哪个都没做深。我心里清楚这个风险——下一阶段大概率要做减法，从这些里挑出真正有信号的，集中火力。

**token 也是成本。** 东西做得越多，烧的 token 越多。AI 是便宜，但不是免费，几十个项目同时跑，这笔账在慢慢变大。这逼着我去想：哪些值得继续喂 token，哪些该停。

**工作流还有瓶颈。** 虽然天天在优化和 AI 协作的方式，但还是会撞到墙——有些事 AI 反复做不对，有些环节我还是得大量手动兜底。这部分的焦虑是真实的，我还没完全捋顺。

这些问题我不打算现在就强行解决。先记下来，让它们在后面的 log 里慢慢被时间和实践回答。

## 下一步

- **决断世界杯小红书**做不做（窗口就这两天）
- 从 30 个里**挑出 2-3 个有信号的**，下个阶段重点投入，其余转入维护或冷藏
- 把 predict_arbitrage 从本地测试推到一个能自己用的状态——这个跟本职契合，优先级最高
- log #04 汇报"做减法"的结果

## 写在最后

广撒网这件事，对错我现在下不了结论。也许半年后回看，我会笑自己"当时怎么这么贪"；也许那 1-2 个跑出来的，正好就藏在这堆里。

但有一点我很确定：**这几十个仓库，是我这辈子离"亲手把想法变成现实"最近的一段时间。** 光是这个体验，已经值回票价。

量变会不会引起质变，我不知道。但量变本身，已经在改变我了。

---

📌 *副业 log 系列：边写代码挣工资，边偷偷给自己开口子，把每一步认真记下来。*

📍 *进度：#01 为什么做 · #02 第一个方向 · #03 铺开 30+ 项目的盘点 · #04 做减法。*
