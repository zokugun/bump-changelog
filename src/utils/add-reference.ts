import type { AsyncDResult } from '@zokugun/xtry';
import type { HeadingConfig, Reference, References, SeparatorConfig, SortConfig } from '#/types.js';
import type { Tokens } from './render-template.js';

import { ok } from '@zokugun/xtry';

import { getHeadingLevel } from './get-heading-level.js';
import { normalizeName } from './normalize-name.js';
import { renderTemplate } from './render-template.js';
import { sortReferences } from './sort-references.js';

export async function addReference(reference: { link: string; name: string; }, version: string, separator: SeparatorConfig | undefined, sort: SortConfig, references: References, heading: HeadingConfig, lines: string[], tokens: Tokens, root: string): AsyncDResult<number> { // {{{
	const releaseReference = await renderReference(reference.name, reference.link, version, tokens, root);

	if(releaseReference.fails) {
		return releaseReference;
	}

	const releaseReferences = references.references.slice();

	releaseReferences.push(releaseReference.value);

	sortReferences(releaseReferences, sort);

	const added = writeReferences(separator, references, heading, lines, releaseReferences);

	return ok(added + 1);
} // }}}

function writeReferences(separator: SeparatorConfig | undefined, references: References, heading: HeadingConfig, lines: string[], definitions: Reference[]): number { // {{{
	const currentReferences = references.references;
	const firstLine = currentReferences[0]?.line;
	let startIndex = firstLine ? lines.indexOf(firstLine) : references.firstIndex;

	if(startIndex < 0) {
		startIndex = references.firstIndex;
	}

	const referenceCount = currentReferences.length;

	lines.splice(startIndex, referenceCount, ...definitions.map(({ line }) => line));

	let added = 0;

	if(separator?.top === 'blankline' && startIndex > 0 && lines[startIndex - 1].trim().length !== 0) {
		lines.splice(startIndex, 0, '');

		startIndex += 1;
		added += 1;
	}

	const bottomIndex = startIndex + definitions.length;

	if(separator?.bottom === 'blankline') {
		if(lines[bottomIndex]?.trim().length !== 0) {
			lines.splice(bottomIndex, 0, '');

			added += 1;
		}
	}
	else if(heading.separator.bottom === 'blankline') {
		if(lines[bottomIndex]?.trim().length !== 0 && getHeadingLevel(bottomIndex, lines)) {
			lines.splice(bottomIndex, 0, '');

			added += 1;
		}
	}
	else if(separator?.bottom === 'none') {
		if(lines[bottomIndex]?.trim().length === 0) {
			lines.splice(bottomIndex, 1);

			added -= 1;
		}
	}
	else if(heading.separator.bottom === 'none') {
		if(lines[bottomIndex]?.trim().length === 0 && getHeadingLevel(bottomIndex, lines)) {
			lines.splice(bottomIndex, 1);

			added -= 1;
		}
	}

	return added;
} // }}}

async function renderReference(nameTemplate: string, linkTemplate: string, version: string, tokens: Tokens, root: string): AsyncDResult<Reference> { // {{{
	const nextTokens = { ...tokens, version };
	const name = await renderTemplate(nameTemplate, nextTokens, root);

	if(name.fails) {
		return name;
	}

	const link = await renderTemplate(linkTemplate, nextTokens, root);

	if(link.fails) {
		return link;
	}

	return ok({ name: normalizeName(name.value), line: `[${name.value}]: ${link.value}` });
} // }}}
