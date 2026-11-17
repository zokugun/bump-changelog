import type { Reference } from '#/types.js';

import { normalizeName } from './normalize-name.js';

const DEFINITION_REGEX = /^\[([^\]]+)\]:\s+/;

export function parseReference(line: string): Reference | undefined {
	const match = DEFINITION_REGEX.exec(line);

	if(!match) {
		return undefined;
	}

	const name = normalizeName(match[1]);

	return { line, name }
}
