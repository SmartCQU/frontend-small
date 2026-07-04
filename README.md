# frontend-small

前端玉米地块模块。这个仓库只包含可嵌入前端页面的玉米地块，不包含单株玉米调试页。

## 包含内容

- `index.html`：玉米地块页面入口。
- `src/main.js`：Three.js 玉米地块核心逻辑。
- `src/styles.css`：页面基础样式。
- `package.json`：依赖和运行脚本。

## 运行

```bash
pnpm install
pnpm dev
```

打开：

```text
http://127.0.0.1:5178/
```

## 接入说明

组员可以把 `src/main.js` 中的 Three.js 场景初始化逻辑封装成 Vue、React 或普通 JS 组件。

最少需要：

- 安装 `three`
- 提供一个 `<canvas id="field-canvas"></canvas>`
- 引入 `src/main.js` 的场景逻辑
- 保留或迁移 `src/styles.css` 中画布和容器相关样式

当前模块不依赖后端接口，可作为纯前端地块组件接入。
