import type { AsyncDResult, DResult, YResult } from '@zokugun/xtry';
import type { Config } from '#/types.js';

import fse from '@zokugun/fs-extra-plus/async';
import { isNonBlankString, isRecord } from '@zokugun/is-it-type';
import { err, ok, stringifyError, xtrySync, yerr, yresAsync } from '@zokugun/xtry';
import YAML from 'yaml';

const CONFIG_FILES: Array<{ name: string; type?: 'json' | 'yaml' }> = [
	{
		name: '.bumpchangelogrc.yml',
		type: 'yaml',
	},
	{
		name: '.bumpchangelogrc.yaml',
		type: 'yaml',
	},
	{
		name: '.bumpchangelogrc.json',
		type: 'json',
	},
	{
		name: '.bumpchangelogrc',
	},
];

export async function loadConfig(fileRoot: string): AsyncDResult<Config> { // {{{
	for(const { name, type } of CONFIG_FILES) {
		const filename = fse.join(fileRoot, name);
		const result = await tryReadConfigFile(filename, fileRoot, name, type);

		if(result.fails || result.success) {
			return result;
		}
	}

	return normalizeConfig({}, fileRoot, '');
} // }}}

async function normalizeConfig(data: unknown, root: string, source: string): AsyncDResult<Config> { // {{{
	if(!isRecord(data)) {
		return err(`Config file ${source} must export an object.`);
	}

	let reference: Config['reference'] | undefined;

	if(isRecord(data.reference)) {
		reference = {
			location: {
				by: 'footnote',
			},
			release: {
				link: '',
				name: '{version}',
			},
			sort: {
				mode: 'alpha-version',
				direction: {
					alpha: 'asc',
					version: 'desc',
				},
			},
			unreleased: {
				link: '',
				name: 'unreleased',
			},
		};

		const { location, release, sort, unreleased } = data.reference;

		if(isNonBlankString<string>(location)) {
			if(location === 'heading') {
				reference.location = {
					by: 'heading',
					position: 'after',
					separator: {
						top: 'none',
						bottom: 'blankline',
					},
				};
			}
			else if(location === 'section') {
				reference.location = {
					by: 'section',
					separator: {
						top: 'blankline',
						bottom: 'blankline',
					},
				};
			}
		}
		else if(isRecord(location)) {
			const { by, position, separator } = location;

			if(by === 'heading') {
				reference.location = {
					by: 'heading',
					position: 'after',
					separator: {
						top: 'none',
						bottom: 'blankline',
					},
				};

				if(position === 'before') {
					reference.location.position = position;
				}
			}
			else if(by === 'section') {
				reference.location = {
					by: 'section',
					separator: {
						top: 'blankline',
						bottom: 'blankline',
					},
				};
			}

			if(isRecord(separator) && reference.location.by !== 'footnote') {
				const { bottom, top } = separator;

				if(bottom === 'none') {
					reference.location.separator.bottom = bottom;
				}

				if(top === 'none' || top === 'blankline') {
					reference.location.separator.top = top;
				}
			}
		}

		if(isRecord(release)) {
			const { link, name } = release;

			if(!isNonBlankString<string>(link)) {
				return err('The "definition.release.link" config is required.')
			}

			reference.release.link = link;

			if(isNonBlankString<string>(name)) {
				reference.release.name = name.trim();
			}
		}
		else {
			return err('The "definition.release" config is required.')
		}

		if(isNonBlankString<string>(sort)) {
			if(sort === 'none') {
				reference.sort = { mode: 'none' };
			}
			else if(sort === 'alphabetical') {
				reference.sort = { mode: sort, direction: 'asc' };
			}
			else if(sort === 'alpha-version') {
				reference.sort = {
					mode: sort,
					direction: {
						alpha: 'asc',
						version: 'desc',
					},
				};
			}
		}
		else if(isRecord(sort)) {
			const mode = sort.mode ?? sort.by;
			const { direction } = sort;

			if(mode === 'none') {
				reference.sort = { mode };
			}
			else if(mode === 'alphabetical') {
				reference.sort = {
					mode,
					direction: direction === 'desc' ? 'desc' : 'asc',
				};
			}
			else if(mode === 'alpha-version') {
				const legacyDirection = direction === 'desc' ? 'desc' : 'asc';
				const alphaDirection = isRecord(direction) && direction.alpha === 'desc' ? 'desc' : legacyDirection;
				const versionDirection = isRecord(direction) && direction.version === 'desc' ? 'desc' : legacyDirection;

				reference.sort = {
					mode,
					direction: {
						alpha: alphaDirection,
						version: versionDirection,
					},
				};
			}
		}

		if(isRecord(unreleased)) {
			const { link, name } = unreleased;

			if(!isNonBlankString<string>(link)) {
				return err('The "reference.unreleased.link" config is required.')
			}

			reference.unreleased.link = link;

			if(isNonBlankString<string>(name)) {
				reference.unreleased.name = name.trim();
			}
		}
		else {
			return err('The "reference.unreleased" config is required.')
		}
	}

	const heading: Config['heading'] = {
		style: 'atx',
		separator: {
			top: 'blankline',
			bottom: 'blankline',
		},
	};

	if(isRecord(data.heading)) {
		const { separator, style } = data.heading;

		if(isRecord(separator)) {
			const { bottom, top } = separator;

			if(bottom === 'none') {
				heading.separator.bottom = bottom;
			}

			if(top === 'none') {
				heading.separator.top = top;
			}
		}

		if(isNonBlankString<string>(style)) {
			const trimmed = style.trim();

			if(trimmed === 'atx' || trimmed === 'setext') {
				heading.style = trimmed;
			}
		}
	}

	const release: Config['release'] = {
		template: '{version} - {date:YYYY-MM-DD}',
	};

	if(isRecord(data.release)) {
		const { template } = data.release;

		if(isNonBlankString<string>(template)) {
			release.template = template.trim();
		}
	}

	const unreleased: Config['unreleased'] = {
		action: 'retain',
		template: 'Unreleased',
	};

	if(isRecord(data.unreleased)) {
		const { action, template } = data.unreleased;

		if(isNonBlankString<string>(action)) {
			const trimmed = action.trim();

			if(trimmed === 'retain' || trimmed === 'remove') {
				unreleased.action = trimmed;
			}
		}

		if(isNonBlankString<string>(template)) {
			unreleased.template = template.trim();
		}
	}

	return ok({
		heading,
		reference,
		release,
		unreleased,
	});
} // }}}

function parseConfigContent(content: string, type?: 'json' | 'yaml'): DResult<unknown> { // {{{
	if(type === 'json') {
		return xtrySync(() => JSON.parse(content) as unknown, stringifyError);
	}

	if(type === 'yaml') {
		return xtrySync(() => YAML.parse(content) as unknown, stringifyError);
	}

	let result = xtrySync(() => JSON.parse(content) as unknown, stringifyError);

	if(result.fails) {
		result = xtrySync(() => YAML.parse(content) as unknown, stringifyError);
	}

	return result;
} // }}}

async function tryReadConfigFile(filename: string, root: string, name: string, type?: 'json' | 'yaml'): Promise<YResult<Config, string, 'not-found'>> { // {{{
	const content = await fse.readFile(filename, 'utf8');

	if(content.fails) {
		if(content.error.code === 'ENOENT') {
			return yerr('not-found');
		}

		return err(`Failed to read ${name} from package: ${stringifyError(content.error)}`);
	}

	const parsed = parseConfigContent(content.value, type);

	if(parsed.fails) {
		return err(`Failed to parse ${name} from package: ${parsed.error}`);
	}

	return yresAsync(normalizeConfig(parsed.value, root, name));
} // }}}
