import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'versionPainter',
            fileName: 'index',
            formats: ['es'],
        },
        rollupOptions: {
            external: id => id === 'vite' || id.startsWith('node:') || id.startsWith('vite/'),
        },
        emptyOutDir: true,
        sourcemap: true,
    },
});
