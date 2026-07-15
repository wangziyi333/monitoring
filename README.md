# Monitoring & Event Tracking

这是一个用于学习前端监控与埋点的全栈演示项目。

## 项目组成

- `frontend`：基于 Vue 3 + Vite 的前台商城与监控后台页面
- `server`：基于 Express 的 mock 服务，负责接收事件、返回看板汇总数据、保存可视化埋点配置

## 主要页面

- `/`：前台促销商城页，承载手动埋点、声明式埋点、动态列表埋点等场景
- `/dashboard`：监控看板
- `/events`：事件中心
- `/visual-tracking`：可视化埋点配置中心
- `/study/foundation`：配合 `docs/superpowers/plans/study.md` 的学习路径页面

## 安装依赖

前端：

```bash
cd frontend
npm install
```

后端：

```bash
cd server
npm install
```

## 启动项目

先启动后端：

```bash
cd server
npm run dev
```

再启动前端：

```bash
cd frontend
npm run dev
```

默认入口：

- 前端首页：`http://localhost:5173/`
- 监控看板：`http://localhost:5173/dashboard`
- 事件中心：`http://localhost:5173/events`
- 可视化埋点：`http://localhost:5173/visual-tracking`
- 后端健康检查：`http://localhost:3001/api/health`

如果 `5173` 端口已被占用，Vite 会自动切换到其他端口，比如 `5174` 或 `5175`。

## 为什么后端之前的 npm run dev 会失败

当前工作区路径包含中文目录名。在 Windows 环境下，有些依赖通过 `npm` -> `.cmd` 包装脚本启动时，可能会出现路径解析异常。

为了解决这个问题，后端开发脚本已经改成直接通过 Node 调用 `tsx`：

```json
"dev": "node ./node_modules/tsx/dist/cli.mjs src/index.ts"
```

这样可以绕过 `tsx.cmd` 的路径解析问题，让 `npm run dev` 在当前目录下稳定运行。

## 当前埋点设计说明

当前商城页里的动态列表埋点采用了“DOM 锚点 + 业务字段”的思路：

- DOM 锚点：`data-track` 或 `data-track-key`
- 业务字段：`data-product-id`、`data-product-name`、`data-position`

这可以帮助我们区分下面两件事：

- “用户点了一个购买按钮”
- “用户点了第几个位置、哪个商品的购买按钮”

## 常用检查命令

前端构建：

```bash
cd frontend
npm run build
```

后端类型检查：

```bash
cd server
npx tsc --noEmit
```
