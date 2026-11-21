import type { Options } from '#/types.js';

import { defineTestsWithInMemoryFiles } from '@zokugun/vitest-toolkit';
import dayjs from 'dayjs';

import { bump } from './rewires/bump.js';

const CAPTURE_REGEX = /#\[\[([^\]]+)\]\]/g;

await defineTestsWithInMemoryFiles(
	(manifest) => bump(manifest.options as Options),
	{
		fixture: 'bump',
		transformFile: (type, _path, content) => {
			if(type !== 'output') {
				return content;
			}

			let replaced = '';
			let lastIndex = 0;

			for(const match of content.matchAll(CAPTURE_REGEX)) {
				const [all, template] = match;

				replaced += content.slice(lastIndex, match.index);
				replaced += dayjs().format(template);

				lastIndex = match.index + all.length;
			}

			replaced += content.slice(lastIndex);

			return replaced;
		},
	},
);
