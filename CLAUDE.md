# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

杭州大富翁 — 双人本地热座大富翁棋牌游戏，杭州地标主题。使用 Electron 封装为 Windows 安装包分发。

## 常用命令

```bash
# 开发：Electron 窗口运行
npm start

# 构建 Windows NSIS 安装包
npm run build
```

构建产物在 `dist/杭州大富翁_Setup_<version>.exe`。如果 GitHub 下载不通，设置环境变量 `ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/` 和 `ELECTRON_BUILDER_BINARIES_MIRROR=https://npmmirror.com/mirrors/electron-builder-binaries/`。

`server.js` 是轻量开发备选方案（`node server.js`，端口 8765），打包构建中不使用。

## 架构

**`index.html`** — 整个游戏：HTML 结构、CSS 样式、Vue 3 应用逻辑全部在一个文件中。Vue 3 全局构建版（`vue.global.js`，即 unpkg 上 `vue.global.prod.js` 的本地副本）通过 `<script>` 标签加载，无打包器、无 ES 模块。

**`electron-main.js`** — Electron 主进程。创建 `BrowserWindow` 通过 `loadFile()` 直接加载 `index.html`。窗口先隐藏加载，`ready-to-show` 时最大化再显示，避免白屏闪烁。渲染进程不开启 Node 集成（`contextIsolation: true`）。

**`package.json`** — 构建配置在 `"build"` 字段。目标为 NSIS 安装包（`oneClick: false`，用户可选安装路径，自动创建桌面和开始菜单快捷方式）。文件白名单仅包含 `index.html`、`vue.global.js`、`electron-main.js` 和 `node_modules/**/*`。ASAR 禁用，资源文件直接从磁盘读取。

### 游戏内部逻辑（`index.html`）

- **棋盘**：24 格，7×7 CSS Grid 布局。顺时针排列：底边从右到左（索引 0—6），左边从下到上（7—12），顶边从左到右（13—18），右边从上到下（19—23）。中间区域（网格行 2—6、列 2—6）被中央面板占据。
- **格子类型**：`corner`（起点/牢房/休息/入狱）、`property`（可购买，同色组双倍租金）、`special-bonus`（奖金）、`boat`（游船传送选择）、`chance`/`destiny`（随机事件卡）。
- **胜利条件**：对手破产。经过起点奖励 $300。拥有同色组全部地产时租金翻倍。
- **状态管理**：通过 `player1`/`player2` 对象（Vue `reactive()`）实现响应式。回合流转由 `currentPlayer` ref 控制，`diceRolling`/`isMoving`/`waitingAction`/`gameOver` 四个守卫变量阻止越权操作。
- **移动动画**：逐格步进，每步间隔 180ms（`startStepMove`）。每步检查是否经过起点。
