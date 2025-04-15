import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [react(), tsconfigPaths()],
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./src/test/setup.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: ['node_modules/', 'src/test/setup.ts', '**/*.d.ts', '**/*.test.{ts,tsx}', '**/*.stories.{ts,tsx}'],
			thresholds: {
				lines: 80,
				functions: 80,
				branches: 80,
				statements: 80
			}
		},
		include: ['src/**/*.test.{ts,tsx}'],
		exclude: ['node_modules', 'dist', '.idea', '.git', '.cache']
	}
});
