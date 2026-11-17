import type { References } from '#/types.js';

import { getHeadingLevel } from './get-heading-level.js';
import { parseReference } from './parse-reference.js';

export function findSectionReferences(headingIndex: number, isATX: boolean, lines: string[]): References {
	const sectionStart = headingIndex + (isATX ? 1 : 2);
	let sectionEnd = lines.length;

	for(let index = sectionStart; index < lines.length; index++) {
		const level = getHeadingLevel(index, lines);

		if(level !== undefined && level <= 2) {
			sectionEnd = index;
			break;
		}
	}

	let sectionEndTrimmed = sectionEnd

	if(sectionEndTrimmed > sectionStart && lines[sectionEndTrimmed - 1].trim().length === 0) {
		sectionEndTrimmed -= 1;
	}

	let index = sectionEndTrimmed - 1;
	const references: References['references'] = [];

	if(index <= sectionStart) {
		return { firstIndex: sectionEnd, references };
	}

	while(index > sectionStart) {
		const reference = parseReference(lines[index]);

		if(!reference) {
			index += 1;

			break;
		}

		references.unshift(reference);
		index -= 1;
	}

	return { firstIndex: index, references };
}
