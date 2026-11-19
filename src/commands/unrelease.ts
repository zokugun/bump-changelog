import type { References } from '#/types.js';
import type { Tokens } from '#/utils/render-template.js';

import { logger, unwrapFatal } from '@zokugun/cli-utils';
import fse from '@zokugun/fs-extra-plus/async';
import { detectEOL, toEOL, toLines } from '@zokugun/text-line-utils';
import process from 'node:process';

import { addLogEntry } from '#/utils/add-log-entry.js';
import { addReference } from '#/utils/add-reference.js';
import { addSection } from '#/utils/add-section.js';
import { addSubSection } from '#/utils/add-sub-section.js';
import { findFootnoteReferences } from '#/utils/find-footnote-references.js';
import { findReferencesBefore } from '#/utils/find-references-before.js';
import { findSubSection } from '#/utils/find-sub-section.js';
import { findTopSection } from '#/utils/find-top-section.js';
import { findUnreleasedSection } from '#/utils/find-unreleased-section.js';
import { getCurrentVersion } from '#/utils/get-current-version.js';
import { loadConfig } from '#/utils/load-config.js';
import { mergeSeparators } from '#/utils/merge-separators.js';
import { renderTemplate } from '#/utils/render-template.js';
import { findSectionReferences } from '#/utils/find-section-references.js';

type Options = {
	added?: boolean;
	breaking?: boolean;
	changed?: boolean;
	fixed?: boolean;
	maintenance?: boolean;
	removed?: boolean;
}

export async function unrelease(message: string | undefined, options: Options): Promise<void> {
	logger.beginTimer();

	const root = process.cwd();
	const config = unwrapFatal(await loadConfig(root));
	const changelogPath = fse.join(root, 'CHANGELOG.md');
	const changelog = unwrapFatal(await fse.readFile(changelogPath, 'utf8'));
	const version = unwrapFatal(await getCurrentVersion(root));
	const tokens: Tokens = { version };
	const unreleased = unwrapFatal(await renderTemplate(config.unreleased.template, tokens, root));
	const eol = detectEOL(changelog, { mode: 'majority' });
	const lines = toLines(changelog);
	const isATX = config.heading.style == 'atx';
	const { separator } = config.heading;

	let unreleasedIndex = findUnreleasedSection(unreleased, isATX, lines);
	let addingReference = false

	if(!unreleasedIndex) {
		const topSectionIndex = findTopSection(isATX, lines);

		if(!topSectionIndex) {
			logger.fatal('Cannot find any section');
		}

		addSection(unreleased, topSectionIndex, isATX, lines, config);

		unreleasedIndex = topSectionIndex;
		addingReference = true;
	}

	let title = 'Changed';

	if(options.added) {
		title = 'Added';
	}
	else if(options.breaking) {
		title = 'Breaking';
	}
	else if(options.changed) {
		title = 'Changed';
	}
	else if(options.fixed) {
		title = 'Fixed';
	}
	else if(options.maintenance) {
		title = 'Maintenance';
	}
	else if(options.removed) {
		title = 'Removed';
	}

	let subsectionIndex = findSubSection(title, unreleasedIndex, isATX, lines);

	if(!subsectionIndex) {
		subsectionIndex = addSubSection(title, unreleasedIndex, isATX, lines, config);
	}

	if(separator.bottom === 'blankline') {
		subsectionIndex += 1;
	}

	addLogEntry(message ?? '', subsectionIndex, isATX, lines);

	if(addingReference && config.reference) {
		const { location, sort, unreleased } = config.reference;

		if(config.reference.location.by === 'footnote') {
			const references = findFootnoteReferences(lines);

			if(!references.references.some(({name}) => name === unreleased.name)) {
				unwrapFatal(await addReference(unreleased, version, location.separator, sort, references, config.heading, lines, tokens, root));
			}
		}
		else if(config.reference.location.by === 'heading') {
			if(config.reference.location.position === 'after') {
				const references: References = {
					firstIndex: unreleasedIndex + (isATX ? 1 : 2),
					references: [],
				};
				const referenceSeparator = mergeSeparators(separator, location.separator);

				unwrapFatal(await addReference(unreleased, version, referenceSeparator, sort, references, config.heading, lines, tokens, root));
			}
			else {
				const references = findReferencesBefore(unreleasedIndex, lines);

				unwrapFatal(await addReference(unreleased, version, location.separator, sort, references, config.heading, lines, tokens, root));
			}
		}
		else {
			const references = findSectionReferences(unreleasedIndex, isATX, lines);

			unwrapFatal(await addReference(unreleased, version, location.separator, sort, references, config.heading, lines, tokens, root));
		}
	}

	const updatedChangelog = lines.join(toEOL(eol));

	unwrapFatal(await fse.writeFile(changelogPath, updatedChangelog, 'utf8'));

	logger.finishTimer();
}
