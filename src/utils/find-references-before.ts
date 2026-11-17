import type { Reference, References } from '#/types.js';

import { parseReference } from './parse-reference.js';

export function findReferencesBefore(headingIndex: number, lines: string[]): References {
	let index = headingIndex;

	if(index > 0 && lines[index - 1].trim().length === 0) {
		index -= 1;
	}

	const references: Reference[] = [];

	while(index > 0) {
		const reference = parseReference(lines[index - 1]);

		if(!reference) {
			break;
		}

		references.unshift(reference);

		index -= 1;
	}

	if(references.length === 0) {
		return { firstIndex: headingIndex, references };
	}

	return { firstIndex: index, references };
}
