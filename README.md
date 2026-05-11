# version-painter

面向 Vite 的小插件：在构建时写入版本脚本（`window.version` / `window.__BUILD_INFO__`），并向 HTML 注入用于核对构建信息的 `<meta>`。

**当前 npm 版本：`0.0.2`**

## 更新日志

### 0.0.2

- 补充 **README**（用法、选项表、GitHub Actions 说明）、**MIT LICENSE**，并在发布包中包含文档与许可证。
- 关闭 JS / d.ts 的 **source map** 输出，减小发包体积。
- **GitHub Actions**：增加版本门禁——推送至 `dev` 时若 `package.json` 版本与 npm 最新版相同则跳过整次 CI；Pull Request 仍始终完整构建。
- 持续集成通过后在版本有更新时自动 **`npm publish`**（需配置 `NPM_TOKEN`）。

### 0.0.1

- 初始发布：`projectInfoHook` 插件、`window.version` / `window.__BUILD_INFO__`、HTML meta 注入等能力。

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

- **Pull Request**：始终执行完整 CI（类型检查、构建），**不因版本未变而跳过**；**不会**发布到 npm。
- **推送到 `dev` / 手动 `workflow_dispatch`**：先比对 **`package.json` 的 `version`** 与 **npm 上该包最新版本**。若相同（未升版本），则 **跳过本次全部 CI（含构建与发布）**，并在「版本检查」作业中输出说明；若 npm 尚无该包或查不到版本，则照常执行 CI。版本有变化时构建通过后执行 **`npm publish`**。
- 仓库需配置 Secret **`NPM_TOKEN`**（建议使用 npm 的 Automation / Granular 发布令牌，避免 CI 要求 OTP）。

## 许可证

[MIT](LICENSE)
