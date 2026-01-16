import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                admin: resolve(__dirname, 'admin/index.html'),
                wholesale: resolve(__dirname, 'wholesale/index.html'),
            },
        },
    },
    publicDir: 'public',
});
