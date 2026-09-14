# 杨玉峰个人作品集

Vite、React、TypeScript 个人作品页面，包含个人介绍、能力、影像与AI实践、网站和工作经历。

当前事实见 [PROJECT.md](PROJECT.md)，视觉标准见 [docs/design-direction.md](docs/design-direction.md)，工作规则见 [AGENTS.md](AGENTS.md)。

## 本地运行

本分支整合两种独立页面：默认首页为简约版，`/p5/` 为隐藏模式。左下角黑白面具入口可往返。开发与生产构建均使用同样的路径。

- `src/` 为简约版，`src/p5/` 为导入的 P5 独立源文件；入口分别是 `index.html`、`p5/index.html`。
- `src/features/mode/` 提供共享模式入口和短转场。两套主题运行在独立文档，不互相注入 CSS，也不同时加载两套页面。
- 相同媒体共用 `public/media/`，P5 人物视频单独保存在 `public/media/p5/hero/`，对应轮廓在 P5 Hero 目录；不可用简约版视频覆盖。
- P5 快照来自用户指定的 `p5-codex-p5-visual-20260908-4661432/work/p5`，包含当时未提交的实现；原工作目录保持。后续可分别修改各自目录，重新构建一起发布。
- 两版可各自发展布局；邮箱、求职方向、作品年份和业绩口径等事实更新时需同时核对。人物轮廓与视频绑定，工程测试验证其哈希。

    npm ci
    git lfs pull
    npm run dev

已批准的网页视频通过 Git LFS 管理。新克隆先恢复媒体；文件名或LFS指针不代表视频内容已到位。媒体关联见 [素材清单](docs/content-inventory.md)。

需要外部媒体根地址时，按 .env.example 设置本机 .env.local 的 VITE_MEDIA_BASE_URL。该设置不表示已完成托管或部署。

## 简约版 Cloudflare 发布

独立 Pages 项目为 `yyf-portfolio-minimal`；不覆盖原 `yang-yufeng-portfolio-preview`。先通过交付检查、提交并推送当前代码，再运行：

    node scripts/prepare-pages.mjs

脚本将刚构建的 `dist` 复制到忽略的 `.agent-state/pages-deploy/<完整提交号>`。小文件由 Pages 托管；超过25 MiB的9个MP4通过302跳转到同一提交的公开GitHub LFS媒体，不压缩或修改正片。脚本要求超限文件已提交为LFS，输出提交信息供线上核验。每个提交只创建一次上传包，避免混入旧文件。

    npx wrangler pages deploy .agent-state/pages-deploy/<完整提交号> --project-name yyf-portfolio-minimal --branch main --commit-hash <完整提交号>

此处 `main` 指 Pages 生产环境，不执行Git分支合并。GitHub PR由用户另行审核。GitHub大视频访问速度及LFS带宽额度仍是限制；当前账户尚未启用R2，未来可迁移媒体存储。生产上线后检查 `/deployment.json`、JS/CSS、图片和视频Range响应。HEVC正片仍受浏览器解码支持影响。

## 交付检查

    npm run check:media
    npm run test:run
    npm run typecheck
    npm run lint
    npm run build

媒体检查验证已跟踪视频的文件头、LFS大小与SHA-256。新批准视频应先暂存对应LFS指针再检查；文件完整不等于浏览器能解码，仍须实际播放。

页面变化检查桌面／手机的布局、点击、滚动、键盘、减少动态及控制台。旧占位视觉脚本已退役。本机 .agent-state/ 保存当前状态和证据，不进入提交。
