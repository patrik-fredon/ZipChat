import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
	plugins: [react(), tsconfigPaths()],
	server: {
		port: 3000,
		proxy: {
			'/api': {
				target: 'http://localhost:8000',
				changeOrigin: true
			},
			'/ws': {
				target: 'ws://localhost:8000',
				ws: true
			}
		}
	}
});
