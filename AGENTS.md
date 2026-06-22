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
- 提交或交付前必须使用项目内 Prettier 配置格式化本次修改的 Vue、JavaScript 等前端文件。
- 新增页面后，如果需要固定入口，要在路由中注册；如果需要菜单入口，要同步后端菜单数据。
- 新增页面必须独立实现，不新增、抽取或引用公共业务组件；新增与编辑页面也不得共用表单组件。
- 业务页面的筛选项、表格列、详情字段和状态转换必须在页面内明确实现，不使用 dictionaries、pageConfig 等通用配置驱动。

验证：

```bash
npm run build
```
