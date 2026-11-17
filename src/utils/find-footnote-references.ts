import type { Reference, References } from '#/types.js';

import { parseReference } from './parse-reference.js';

export function findFootnoteReferences(lines: string[]): References {
	const references: Reference[] = [];

	let index = lines.length - 1;

	while(index >= 0) {
		if(lines[index].trim().length === 0) {
			index -= 1;

			continue;
		}

		const reference = parseReference(lines[index]);

		if(!reference) {
			index += 1;

			break;
		}

		references.unshift(reference);

		index--;
	}

	return {
		firstIndex: index,
		references,
	};
}
