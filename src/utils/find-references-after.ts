import type { Reference, References } from '#/types.js';

import { parseReference } from './parse-reference.js';

export function findReferencesAfter(headingIndex: number, isATX: boolean, lines: string[]): References {
	const startIndex = headingIndex + (isATX ? 0 : 1) + 1;
	const endIndex = lines.length;

	const references: Reference[] = [];

	let index = startIndex;

	if(index < endIndex && lines[index].trim().length === 0) {
		index += 1;
	}

	const referenceIndex = index;

	while(index < endIndex) {
		const reference = parseReference(lines[index]);

		if(!reference) {
			break;
		}

		references.push(reference);

		index += 1;
	}

	return {
		firstIndex: referenceIndex,
		references,
	};
}
