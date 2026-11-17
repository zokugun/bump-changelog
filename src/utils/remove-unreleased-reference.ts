import type { AsyncDResult } from '@zokugun/xtry';
import type { ReferenceConfig, References } from '#/types.js';
import type { Tokens } from './render-template.js';

import { ok } from '@zokugun/xtry';

import { normalizeName } from './normalize-name.js';
import { renderTemplate } from './render-template.js';

export async function removeUnreleasedReference(reference: ReferenceConfig, oldVersion: string, references: References, lines: string[], tokens: Tokens, root: string): AsyncDResult<number> {
	const oldTokens = { ...tokens, version: oldVersion };
	const name = await renderTemplate(reference.unreleased.name, oldTokens, root);

	if(name.fails) {
		return name;
	}

	const normalizedName = normalizeName(name.value);
	const unreleasedReference = references.references.find((entry) => entry.name === normalizedName);

	if(!unreleasedReference) {
		return ok(0);
	}

	const lineIndex = lines.indexOf(unreleasedReference.line);

	if(lineIndex < 0) {
		return ok(0);
	}

	let startIndex = lineIndex;
	let endIndex = lineIndex + 1;

	if(references.references.length === 1) {
		const { separator } = reference.location;

		if(separator) {
			if(separator.top === 'blankline' && lines[startIndex - 1]?.trim().length === 0) {
				startIndex--;
			}

			if(separator.bottom === 'blankline' && lines[endIndex]?.trim().length === 0) {
				endIndex++;
			}
		}
	}

	lines.splice(startIndex, endIndex - startIndex);

	return ok(endIndex - startIndex);
}
