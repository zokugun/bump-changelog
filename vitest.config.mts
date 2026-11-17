import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	oxc: {
		target: 'es2022',
	},
	resolve: {
		alias: [
			{
				find: '#',
				replacement: path.resolve('src'),
			},
		],
	},
	test: {
		environment: 'node',
		include: ['./test/**/*.test.ts'],
		reporters: 'dot',
		typecheck: {
			enabled: true,
		},
		coverage: {
			reporter: ['html'],
			reportsDirectory: './coverage',
		},
		server: {
			deps: {
				inline: [
					'@zokugun/fs-extra-plus',
				],
			},
		},
	},
});
