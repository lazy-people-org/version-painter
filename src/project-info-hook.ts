import fs from 'node:fs';
import path from 'node:path';
import type { HtmlTagDescriptor, Plugin, ResolvedConfig } from 'vite';

export interface BuildInfoSnapshot {
    version: string;
    builtAt: string;
    mode: string;
}

/**
 * 插件选项：相对 Vite 项目根的路径
 */
export interface ProjectInfoHookOptions {
    filename?: string; /** 默认 `src/assets/scripts/version.js` */
    value?: string; /** 写入 `window.version` 的文本；不传则使用构建开始时刻的时间戳 */
    injectMeta?: boolean; /** 为 false 时不向 HTML 注入 meta（默认 true，便于「查看网页源代码」核对） */
    metaVersionName?: string; /** `<meta name="...">` 的版本号字段名，默认 `app-version` */
    metaBuiltAtName?: string; /** 构建时间的 meta name，默认 `app-built-at`（值为 ISO8601） */
    logToConsole?: boolean; /** 为 true 时在加载 version.js 后 `console.info('[build]', window.__BUILD_INFO__)`（默认 false） */
}

const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const formatedTimeStr = (now: Date) => `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}_${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;

function buildScriptSource(snapshot: BuildInfoSnapshot, logToConsole: boolean): string {
    const info = JSON.stringify(snapshot);
    let src = `window.version = ${JSON.stringify(snapshot.version)};\n`;
    src += `window.__BUILD_INFO__ = ${info};\n`;
    if (logToConsole) {
        src += 'console.info("[build]", window.__BUILD_INFO__);\n';
    }
    return src;
}

function computeSnapshot(options: ProjectInfoHookOptions | undefined, mode: string): BuildInfoSnapshot {
    const now = new Date();
    const stamp = formatedTimeStr(now);
    const version = options?.value ?? stamp;
    return { version, builtAt: now.toISOString(), mode };
}

/**
 * 在每次构建开始时写入 `window.version` 与 `window.__BUILD_INFO__`，并向 HTML 注入 meta。
 * 未提供 `value` 时使用当前时间戳；需要固定版本号或任意文案时传入 `value`。
 * 默认输出：`{projectRoot}/src/assets/scripts/version.js`
 */
export function projectInfoHook(options?: ProjectInfoHookOptions): Plugin {
    let resolvedConfig: ResolvedConfig;
    let lastSnapshot: BuildInfoSnapshot | undefined;

    const relativePath = options?.filename ?? 'src/assets/scripts/version.js';

    const writeVersionFile = (snapshot: BuildInfoSnapshot) => {
        const opath = path.resolve(resolvedConfig.root, relativePath);
        fs.mkdirSync(path.dirname(opath), { recursive: true });
        fs.writeFileSync(opath, buildScriptSource(snapshot, options?.logToConsole ?? false));
    };

    return {
        name: 'project-info-hook',
        configResolved(config) {
            resolvedConfig = config;
        },
        buildStart() {
            const snapshot = computeSnapshot(options, resolvedConfig.mode);
            lastSnapshot = snapshot;
            writeVersionFile(snapshot);
            const abs = path.resolve(resolvedConfig.root, relativePath);
            const displayPath = path.relative(resolvedConfig.root, abs) || relativePath;
            this.info(`[project-info-hook] 已写入 ${displayPath}，version=${JSON.stringify(snapshot.version)}，mode=${snapshot.mode}`);
        },
        transformIndexHtml(): HtmlTagDescriptor[] | undefined {
            if (options?.injectMeta === false) {
                return undefined;
            }
            const snapshot = lastSnapshot ?? computeSnapshot(options, resolvedConfig.mode);
            if (!lastSnapshot) {
                lastSnapshot = snapshot;
                writeVersionFile(snapshot);
            }
            const versionName = options?.metaVersionName ?? 'app-version';
            const builtAtName = options?.metaBuiltAtName ?? 'app-built-at';
            return [
                {
                    tag: 'meta',
                    attrs: { name: versionName, content: snapshot.version },
                    injectTo: 'head-prepend',
                },
                {
                    tag: 'meta',
                    attrs: { name: builtAtName, content: snapshot.builtAt },
                    injectTo: 'head-prepend',
                },
            ];
        },
    };
}
