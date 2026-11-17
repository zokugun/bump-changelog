import { buildCliFileTests } from '@zokugun/vitest-toolkit';
import dayjs from 'dayjs';

import { Options } from '#/types.js';
import { run } from './rewires/run.js';

const CAPTURE_REGEX = /#\[\[([^\]]+)\]\]/g;

buildCliFileTests(
	(manifest) => run(manifest.options as Options),
	{
		transformFile: (type, path, content) => {
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
