import path from 'node:path';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';

const root = path.resolve(__dirname, 'example');

export default defineConfig({
    root,

    base: '/micromark-react',

    plugins: [react()],

    css: {
        postcss: {
            plugins: [tailwindcss()],
        },
    },

    build: {
        outDir: './dist',
        rollupOptions: {
            input: {
                stream: path.resolve(root, 'pages/stream/index.html'),
            },
        },
    },

    resolve: {
        alias: {
            '@hoboy/micromark-react': path.resolve(__dirname, 'src'),
            '@': path.resolve(__dirname, 'example'),
        },
    },

    server: {
        port: 8765,
        open: true,
    },
});
