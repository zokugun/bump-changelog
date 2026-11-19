import type { Tokens } from '#/utils/render-template.js';
import type { Options, References } from '#/types.js';

import { logger, unwrapFatal } from '@zokugun/cli-utils';
import fse from '@zokugun/fs-extra-plus/async';
import { isNonBlankString } from '@zokugun/is-it-type';
import { detectEOL, toEOL, toLines } from '@zokugun/text-line-utils';
import process from 'node:process';

import { addReference } from '#/utils/add-reference.js';
import { findFootnoteReferences } from '#/utils/find-footnote-references.js';
import { findReferencesAfter } from '#/utils/find-references-after.js';
import { findReferencesBefore } from '#/utils/find-references-before.js';
import { findSectionReferences } from '#/utils/find-section-references.js';
import { findUnreleasedSection } from '#/utils/find-unreleased-section.js';
import { loadConfig } from '#/utils/load-config.js';
import { removeUnreleasedReference } from '#/utils/remove-unreleased-reference.js';
import { renderTemplate } from '#/utils/render-template.js';
import { replaceUnreleasedReference } from '#/utils/replace-unreleased-reference.js';

export async function bump(options: Options): Promise<void> {
	logger.beginTimer();

	const newVersion = isNonBlankString(options.new) ? options.new : process.env.npm_new_version;

	if(!isNonBlankString<string>(newVersion)) {
		logger.fatal('The new version is missing.');
	}

	const oldVersion = isNonBlankString(options.old) ? options.old : process.env.npm_old_version;

	if(!isNonBlankString<string>(oldVersion)) {
		logger.fatal('The old version is missing.');
	}

	const root = process.cwd();
	const config = unwrapFatal(await loadConfig(root));
	const changelogPath = fse.join(root, 'CHANGELOG.md');
	const changelog = unwrapFatal(await fse.readFile(changelogPath, 'utf8'));
	const tokens: Tokens = { version: newVersion };
	const unreleased = unwrapFatal(await renderTemplate(config.unreleased.template, tokens, root));
	const release = unwrapFatal(await renderTemplate(config.release.template, tokens, root));
	const eol = detectEOL(changelog, { mode: 'majority' });
	const lines = toLines(changelog);
	const isATX = config.heading.style == 'atx';
	const isRemovingUnreleased = config.unreleased.action === 'remove';

	let unreleasedIndex = findUnreleasedSection(unreleased, isATX, lines);

	if(!unreleasedIndex) {
		logger.fatal('Cannot find the unreleased section');
	}

	let references: References | undefined;

	if(config.reference) {
		if(config.reference.location.by === 'footnote') {
			references = findFootnoteReferences(lines);
		}
		else if(config.reference.location.by === 'heading') {
			if(config.reference.location.position === 'after') {
				references = findReferencesAfter(unreleasedIndex, isATX, lines);
			}
			else {
				references = findReferencesBefore(unreleasedIndex, lines);
			}
		}
		else {
			references = findSectionReferences(unreleasedIndex, isATX, lines);
		}

		if(
			config.reference.location.by === 'footnote'
			|| (!isRemovingUnreleased && config.reference.location.by === 'heading' && config.reference.location.position === 'before')
		) {
			unwrapFatal(await replaceUnreleasedReference(config.reference, oldVersion, newVersion, references, lines, tokens, root));
		}
		else {
			const result = await removeUnreleasedReference(config.reference, oldVersion, references, lines, tokens, root);

			if(result.fails) {
				unwrapFatal(result);
			}

			const removed = result.value;

			if(config.reference.location.by === 'heading' && config.reference.location.position === 'before') {
				unreleasedIndex -= removed;
			}
		}
	}

	let added = 0;

	if(isRemovingUnreleased) {
		if(isATX) {
			lines[unreleasedIndex] = `## ${release}`;
		}
		else {
			lines[unreleasedIndex] = release;
			lines[unreleasedIndex + 1] = '-'.repeat(release.length);
		}
	}
	else {
		const { separator } = config.heading;

		if(isATX) {
			if(separator.bottom === 'blankline' || separator.top === 'blankline') {
				lines.splice(unreleasedIndex + 1, 0, '');

				added += 1;
			}

			lines.splice(unreleasedIndex + added + 1, 0, `## ${release}`);

			added += 1;
		}
		else {
			if(separator.bottom === 'blankline' || separator.top === 'blankline') {
				lines.splice(unreleasedIndex + 2, 0, '');

				added += 1;
			}

			lines.splice(unreleasedIndex + added + 2, 0, release, '-'.repeat(release.length));

			added += 2;
		}
	}

	if(config.reference && references) {
		const { location: { separator }, release, sort, unreleased } = config.reference;

		if(config.reference.location.by === 'footnote') {
			references.firstIndex += added;
		}
		else if(config.reference.location.by === 'heading') {
			if(config.reference.location.position === 'after') {
				if(!isRemovingUnreleased) {
					references = findReferencesBefore(unreleasedIndex + added, lines);

					added += unwrapFatal(await addReference(unreleased, newVersion, separator, sort, references, config.heading, lines, tokens, root));
				}

				references = findReferencesAfter(unreleasedIndex + added, isATX, lines);
			}
			else {
				references = findReferencesBefore(unreleasedIndex + added, lines);
			}
		}
		else {
			if(!isRemovingUnreleased) {
				references = findSectionReferences(unreleasedIndex, isATX, lines);

				added += unwrapFatal(await addReference(unreleased, newVersion, separator, sort, references, config.heading, lines, tokens, root));
			}

			references = findSectionReferences(unreleasedIndex + added, isATX, lines);
		}

		unwrapFatal(await addReference(release, newVersion, separator, sort, references, config.heading, lines, tokens, root));
	}

	const updatedChangelog = lines.join(toEOL(eol));

	unwrapFatal(await fse.writeFile(changelogPath, updatedChangelog, 'utf8'));

	logger.finishTimer();
}
