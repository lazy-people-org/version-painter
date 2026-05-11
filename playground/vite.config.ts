import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { projectInfoHook } from '../src/index.js';

const playgroundDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    root: playgroundDir,
    plugins: [projectInfoHook()],
});
