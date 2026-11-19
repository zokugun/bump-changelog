import { Config } from '#/types.js';

export function addSubSection(title: string, sectionIndex: number, isATX: boolean, lines: string[], config: Config): number {
	const { separator } = config.heading;

	let index = sectionIndex + (isATX ? 1 : 2);

	if((separator.bottom === 'blankline' || separator.top === 'blankline')) {
		if(lines[index].trim().length !== 0) {
			lines.splice(index, 0, '');
		}

		index += 1;
	}

	lines.splice(index, 0, `### ${title}`);

	if((separator.bottom === 'blankline' || separator.top === 'blankline') && lines[index + 1].trim().length !== 0) {
		if(separator.top === 'blankline') {
			lines.splice(index + 1, 0, '');
		}

		if(separator.bottom === 'blankline') {
			lines.splice(index + 1, 0, '');
		}
	}

	return index;
}
