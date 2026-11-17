import type { AsyncDResult } from '@zokugun/xtry';
import type { ReferenceConfig, References } from '#/types.js';
import type { Tokens } from './render-template.js';

import { OK } from '@zokugun/xtry';

import { normalizeName } from './normalize-name.js';
import { renderTemplate } from './render-template.js';

export async function replaceUnreleasedReference(reference: ReferenceConfig, oldVersion: string, newVersion: string, references: References, lines: string[], tokens: Tokens, root: string): AsyncDResult {
	const oldTokens = { ...tokens, version: oldVersion };
	const unreleasedName = await renderTemplate(reference.unreleased.name, oldTokens, root);

	if(unreleasedName.fails) {
		return unreleasedName;
	}

	const normalizedName = normalizeName(unreleasedName.value);

	const unreleasedReference = references.references.find(({ name }) => name === normalizedName);

	if(!unreleasedReference) {
		return OK;
	}

	const newTokens = { ...tokens, version: newVersion };
	const link = await renderTemplate(reference.unreleased.link, newTokens, root);

	if(link.fails) {
		return link;
	}

	const lineIndex = lines.indexOf(unreleasedReference.line, Math.max(0, references.firstIndex));

	if(lineIndex < 0) {
		return OK;
	}

	const line = `[${unreleasedName.value}]: ${link.value}`;

	lines[lineIndex] = line;
	unreleasedReference.line = line;

	return OK;
}
