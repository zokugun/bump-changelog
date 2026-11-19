import { buildCliFileTests } from '@zokugun/vitest-toolkit';

import { unrelease } from './rewires/unrelease.js';

buildCliFileTests(
	(manifest) => unrelease(
		manifest.message as Parameters<typeof unrelease>[0],
		manifest.options as Parameters<typeof unrelease>[1],
	),
	{
		fixture: 'unrelease',
	},
);
