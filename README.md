# version-painter

面向 Vite 的小插件：在构建时写入版本脚本（`window.version` / `window.__BUILD_INFO__`），并向 HTML 注入用于核对构建信息的 `<meta>`。

## 特性

- 构建开始时生成指定路径下的 `version.js`（可配置）
- 注入 `app-version`、`app-built-at` 等 meta（可关闭或改名）
- 可选 `console.info` 输出构建信息
- 类型完备，适用于 TypeScript 项目

## 安装

```bash
npm install version-painter
```

对等依赖：**Vite** 6 / 7 / 8（与项目中的 `vite` 版本一致即可）。

## 使用

在 `vite.config.ts` 中：

```ts
import { defineConfig } from 'vite';
import { projectInfoHook } from 'version-painter';

export default defineConfig({
    plugins: [
        projectInfoHook({
            // value: process.env.CI_VERSION, // 可选：自定义版本字符串；不传则用构建时刻时间戳
            // filename: 'src/assets/scripts/version.js',
            // injectMeta: true,
            // logToConsole: false,
        }),
    ],
});
```

在入口 HTML 中先于业务脚本引入生成的版本文件（路径需与 `filename` 一致），例如：

```html
<script src="/src/assets/scripts/version.js"></script>
```

构建后在浏览器中可使用：

- `window.version`：字符串
- `window.__BUILD_INFO__`：`{ version, builtAt, mode }`

查看网页源代码可见注入的 meta。

## 选项（`ProjectInfoHookOptions`）

| 字段              | 说明                                                        |
| ----------------- | ----------------------------------------------------------- |
| `filename`        | 相对项目根的路径，默认 `src/assets/scripts/version.js`      |
| `value`           | 写入的版本文案；不传则为构建开始时刻的时间戳字符串          |
| `injectMeta`      | 是否注入 meta，默认 `true`                                  |
| `metaVersionName` | 版本 meta 的 `name`，默认 `app-version`                     |
| `metaBuiltAtName` | 构建时间 meta 的 `name`，默认 `app-built-at`                |
| `logToConsole`    | 是否在加载脚本后 `console.info('[build]', …)`，默认 `false` |

## 本地开发本仓库

```bash
npm ci
npm run build
npm run dev
```

`npm run dev` 会启动 `playground` 演示工程。

## GitHub Actions

- **Pull Request**：仅执行类型检查与构建，**不会**发布到 npm。
- **推送到 `dev`**：构建成功后自动执行 **`npm publish`**。发版前请先提升 **`package.json` 的 `version`**（同一版本不可重复发布）；仓库需配置 Secret **`NPM_TOKEN`**（建议使用 npm 的 Automation / Granular 发布令牌，避免 CI 要求 OTP）。
- 可在 Actions 中 **手动运行**同一工作流（`workflow_dispatch`），同样在构建通过后发布。

## 许可证

[MIT](LICENSE)
