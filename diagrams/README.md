# 插图源文件

本目录保存《DeepSeek Harness 高级教材》插图的 HTML 源与渲染脚本。读者可以忽略；维护者修改后重新渲染 `../images/*.png`。

## 文件

| 文件 | 作用 |
|---|---|
| `base.css` | 全部共享样式：画布、节点、泳道、箭头、代码块、表格、层级堆叠、序列图 |
| `fig-part1.html` | 第 1～5 章的图（含四层模型、Fiber 状态机、epoch、分派模式、作用域准入、层叠） |
| `fig-part2.html` | 第 6～10 章的图（turn 时序、工具管线、日志与 surface、预算三层、仓库地形） |
| `fig-part3.html` | 第 11～15 章的图（决策树、能力包解剖、执行世界、adapter 接缝、wire API） |
| `fig-part4.html` | 封面、全书地图与第 16～19 章的图 |
| `render.mjs` | 用 Playwright 逐个截图 `section.figure`，输出到 `../images/<id>.png` |

每个 `<section class="figure" id="fig-<name>">` 对应一张 `../images/<name>.png`。

## 渲染

需要 Playwright 的 Chromium。仓库的开发依赖里已有 `playwright-core`。

```sh
cd dsh-advanced-tutorial/diagrams

PLAYWRIGHT_CORE=/absolute/path/to/playwright-core/index.mjs \
CHROMIUM_PATH=/absolute/path/to/chrome-headless-shell.exe \
node render.mjs                 # 渲染全部 fig-*.html
node render.mjs fig-part2       # 只渲染某个文件的图
```

不设置 `CHROMIUM_PATH` 时 Playwright 使用自己安装的浏览器；报找不到浏览器就运行 `npx playwright install chromium`。

本机已验证可用的一组路径（Windows，随仓库安装位置变化）：

```sh
PLAYWRIGHT_CORE=D:/workspace/harness/deepseek/deepseek-harness/node_modules/.pnpm/playwright-core@1.61.1/node_modules/playwright-core/index.mjs
CHROMIUM_PATH=C:/Users/<you>/AppData/Local/ms-playwright/chromium_headless_shell-<build>/chrome-headless-shell-win64/chrome-headless-shell.exe
```

## 约定

- 画布 1100×640（封面同尺寸），截图 `deviceScaleFactor: 1.5`，输出 1650px 宽 PNG。
- 颜色：DeepSeek 蓝 `#4D6BFE`；正文墨色 `#0F172A`；辅助灰 `#64748B`；强调色 teal / amber / violet / red 各有 `-weak` 背景变体。
- 中文字体优先 `Microsoft YaHei`，后备 `Noto Sans SC`、`PingFang SC`。
- 图中文字尽量短；解释放正文，图注负责说明"这张图想让你记住什么"。
- 图号写在 PNG 右下角（`.fig-no`），与正文图注一致。
- 事件名后用 `(wf)` 表示 waterfall，避免使用在部分字体下缺失的符号。
- 箭头方向用类表达：`.arrow.h` / `.arrow.v` / `.left` / `.up` / `.dashed`；序列图用 `.msg`（耐久）、`.msg.live`（进程内，虚线）、`.msg.warn`（仅日志），左向加 `.left`。**不要用负宽度表达反向箭头。**

## 新增一张图

1. 在对应 `fig-partN.html` 里加一个 `<section class="figure" id="fig-<name>">`。
2. 运行 `node render.mjs fig-partN`，确认 `../images/<name>.png` 生成并**打开看一眼**：绝对定位的图很容易重叠。
3. 在章节正文插入 `![中文说明](images/<name>.png)` 与一行图注 `*图 N-1 · …*`。
4. 更新教材 README 的"图表索引"。
