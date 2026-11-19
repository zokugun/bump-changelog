import type { SeparatorConfig } from '#/types.js';

export function mergeSeparators(heading: SeparatorConfig, link: SeparatorConfig | undefined): SeparatorConfig {
	const separator = {
		top: heading.bottom,
		bottom: heading.top,
	};

	if (link) {
		if (link.top === 'blankline') {
			separator.top = 'blankline';
		}

		if (link.bottom === 'blankline') {
			separator.bottom = 'blankline';
		}
	}

	return separator;
}
