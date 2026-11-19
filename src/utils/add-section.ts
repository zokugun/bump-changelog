import { Config } from '#/types.js';

export function addSection(title: string, index: number, isATX: boolean, lines: string[], config: Config): number {
	const { separator } = config.heading;

	let added = 0;

	if(separator.top === 'blankline' && lines[index - 1]?.trim().length !== 0) {
		lines.splice(index, 0, '');

		added += 1;
	}

	if(isATX) {
		lines.splice(index + added, 0, `## ${title}`);

		added += 1;
	}
	else {
		lines.splice(index + added, 0, title, '-'.repeat(title.length));

		added += 2;
	}

	if(separator.bottom === 'blankline' && lines[index + added + 1].trim().length !== 0) {
		lines.splice(index + added, 0, '');

		added += 1;
	}

	return added;
}
