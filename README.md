# 杨玉峰个人作品集

Vite、React、TypeScript 个人作品页面，包含个人介绍、能力、影像与AI实践、网站和工作经历。

当前事实见 [PROJECT.md](PROJECT.md)，视觉标准见 [docs/design-direction.md](docs/design-direction.md)，工作规则见 [AGENTS.md](AGENTS.md)。

## 本地运行

    npm ci
    git lfs pull
    npm run dev

已批准的网页视频通过 Git LFS 管理。新克隆先恢复媒体；文件名或LFS指针不代表视频内容已到位。媒体关联见 [素材清单](docs/content-inventory.md)。

需要外部媒体根地址时，按 .env.example 设置本机 .env.local 的 VITE_MEDIA_BASE_URL。该设置不表示已完成托管或部署。

## 交付检查

    npm run check:media
    npm run test:run
    npm run typecheck
    npm run lint
    npm run build

媒体检查验证已跟踪视频的文件头、LFS大小与SHA-256。新批准视频应先暂存对应LFS指针再检查；文件完整不等于浏览器能解码，仍须实际播放。

页面变化检查桌面／手机的布局、点击、滚动、键盘、减少动态及控制台。旧占位视觉脚本已退役。本机 .agent-state/ 保存当前状态和证据，不进入提交。
