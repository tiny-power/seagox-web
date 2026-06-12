# seagox-web Instructions

这是 Vue 2 + Element UI 前端项目，目录位于 `/Users/xie/Documents/project/seagox-web`。

配套后端项目位于 `/Users/xie/Documents/project/seagox-api`。

前端约定：

- 系统页面优先放在 `src/views/system/`。
- 路由配置在 `src/router/index.js`。
- 接口请求使用现有 `this.$axios`。
- 页面样式优先复用已有全局类，例如 `searchView`、`toolView`、`pagination`。
- 表格、弹窗、表单优先沿用 Element UI 组件和现有页面交互模式。
- 不要手动修改 `dist/` 或 `node_modules/`。
- 新增页面后，如果需要固定入口，要在路由中注册；如果需要菜单入口，要同步后端菜单数据。
- 涉及后端新增表、字段、菜单或初始数据时，需要同步更新后端 `src/main/resources/sql/` 下所有数据库脚本。

验证：

```bash
npm run build
```
