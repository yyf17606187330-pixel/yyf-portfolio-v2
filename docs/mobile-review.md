# 移动端修复核对

## 当前行为

1. 对角箭头使用 SVG，手机不会再变成蓝色表情；固定隐藏模式标签不参与滚动文字渐显。
2. 简约 Hero 在触屏/窄屏加载已有同一视频，静音内联循环，离屏或弹层打开暂停。自动播放被系统阻止时，可点“播放人物动画”。减少动态模式仍显示封面。
3. 相册放大后，左右按钮、滑块、键盘及单指横滑均可换图；选中图保持完整画幅，点击或 Esc 可缩回。两侧退开动画保持，双指手势不触发换图。
4. 关于我人物区域在触屏显示“点击切换人物视频”，再次点击返回；桌面悬停保持。
5. 两版调色作品均可进入大播放器观看现有短片，标记为“调色片段”；没有改写视频、预览秒数或时长。

## 修改文件与原因

| 文件 | 改动及原因 |
| --- | --- |
| `PROJECT.md` | 更新当前手机交互与生产发布事实。 |
| `docs/dual-mode-review.md` | 更新当前手机交互与生产发布事实。 |
| `src/features/about/AboutSection.css` | 人物点击区域与至少44px的提示，沿用各自主题颜色。 |
| `src/features/about/AboutSection.test.tsx` | 更新或新增交互回归测试，验证对应移动端行为。 |
| `src/features/about/AboutSection.tsx` | 触屏人物视频点击切换，再点返回；保留桌面悬停揭露，替换箭头。 |
| `src/features/about/SkillCards.tsx` | 仅将对角箭头替换为统一 SVG，保留该版布局和行为。 |
| `src/features/capabilities/AiImageCase.tsx` | 仅将对角箭头替换为统一 SVG，保留该版布局和行为。 |
| `src/features/capabilities/ImageGallery.test.tsx` | 更新或新增交互回归测试，验证对应移动端行为。 |
| `src/features/capabilities/ImageGallery.tsx` | 放大状态保留按钮/滑块/键盘/单指横滑换图，防止滑动误触点击；保留完整画幅。 |
| `src/features/contact/ContactSection.tsx` | 仅将对角箭头替换为统一 SVG，保留该版布局和行为。 |
| `src/features/hero/Hero.test.tsx` | 更新或新增交互回归测试，验证对应移动端行为。 |
| `src/features/hero/Hero.tsx` | 手机加载人物视频并提供播放/暂停；桌面滚动叙事和减少动态封面保留。 |
| `src/features/intro/CollageIntro.tsx` | 仅将对角箭头替换为统一 SVG，保留该版布局和行为。 |
| `src/features/mode/ModeSwitch.tsx` | 固定入口跳过滚动文字隐藏，箭头改成 SVG。 |
| `src/features/works/LongFormProjects.test.tsx` | 更新或新增交互回归测试，验证对应移动端行为。 |
| `src/features/works/LongFormProjects.tsx` | 现有调色短片源接入大播放器，按钮准确标明调色片段。 |
| `src/hooks/usePortfolioTextTargets.test.tsx` | 更新或新增交互回归测试，验证对应移动端行为。 |
| `src/p5/App.tsx` | 仅将对角箭头替换为统一 SVG，保留该版布局和行为。 |
| `src/p5/features/about/AboutSection.css` | 人物点击区域与至少44px的提示，沿用各自主题颜色。 |
| `src/p5/features/about/AboutSection.test.tsx` | 更新或新增交互回归测试，验证对应移动端行为。 |
| `src/p5/features/about/AboutSection.tsx` | 触屏人物视频点击切换，再点返回；保留桌面悬停揭露，替换箭头。 |
| `src/p5/features/about/SkillCards.tsx` | 仅将对角箭头替换为统一 SVG，保留该版布局和行为。 |
| `src/p5/features/hero/Hero.tsx` | 仅将对角箭头替换为统一 SVG，保留该版布局和行为。 |
| `src/p5/features/works/LongFormProjects.test.tsx` | 更新或新增交互回归测试，验证对应移动端行为。 |
| `src/p5/features/works/LongFormProjects.tsx` | 现有调色短片源接入大播放器，按钮准确标明调色片段。 |
| `src/styles/index.css` | 手机 Hero 播放按钮的定位、触摸尺寸及焦点样式。 |
| `src/features/navigation/ArrowIcon.tsx` | 新增继承文字颜色的 SVG 线条箭头，避免 iOS 表情替换。 |
| `src/hooks/useTouchVideo.test.tsx` | 更新或新增交互回归测试，验证对应移动端行为。 |
| `src/hooks/useTouchVideo.ts` | 手机内联播放、离屏/后台/弹层暂停；被限制时在点击手势内重试。 |

## 已运行检查

- `npm run test:run -- --reporter=dot`：61个文件，454项测试通过。
- `npm run check:media`：8项检查器测试通过，81/81媒体通过。
- `npm run typecheck`、`npm run lint`：通过。
- `npm run build`：通过；146模块，两版HTML和独立主题样式。
- `git diff --check`：通过。
- 最初新增回归测试如预期暴露旧相册禁用换图与缺少手机播放；实现后同一检查通过。

## 实测边界与人工检查

用户决定自行检查手机。Hermes桌面健康截图正常，但读取Chrome后下一步返回“No active window”，当前无法可靠进行页面操作；未宣称手机、桌面视觉或浏览器控制台实测通过。

请手机刷新正式网页，查看：Hero播放按钮；关于我人物点击切换；相册放大后左右滑动/按钮/滑块；调色短片打开关闭；隐藏模式标签与线条箭头。自动播放仍取决于iOS省电、减少动态及浏览器策略，手动入口用于受限时播放。原两份来源工作树不改写。
