# 杨玉峰个人作品集

Vite、React、TypeScript 个人作品页面，包含个人介绍、能力、影像与AI实践、网站和工作经历。

当前事实见 [PROJECT.md](PROJECT.md)，视觉标准见 [docs/design-direction.md](docs/design-direction.md)，工作规则见 [AGENTS.md](AGENTS.md)。

## 本地运行

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
