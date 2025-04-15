import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [react()],
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./src/tests/setup.ts'],
		coverage: {
			reporter: ['text', 'json', 'html'],
			exclude: ['node_modules/', 'src/tests/', '**/*.d.ts', '**/*.test.{ts,tsx}', '**/*.stories.{ts,tsx}']
		}
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src')
		}
	}
});
