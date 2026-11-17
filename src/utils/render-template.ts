import type { GitTokens } from '@zokugun/git-toolkit';
import type { AsyncDResult } from '@zokugun/xtry';

import { loadGitTokens } from '@zokugun/git-toolkit';
import { err, ok } from '@zokugun/xtry';
import dayjs from 'dayjs';

export type Tokens = {
	git?: GitTokens;
	version: string;
};

const CAPTURE_REGEX = /\{(?:(date):([^}]+)|(git)\.([0-9A-Za-z]+)|(version))\}/g;
const DETECT_REGEX = /\{(?:date|git|version)(?:(:|\.)[^}]+)?\}/;
const GIT_PROPERTIES = ['branch', 'commitId', 'distance'];

export async function renderTemplate(template: string, tokens: Tokens, cwd: string): AsyncDResult<string> {
	if(!DETECT_REGEX.test(template)) {
		return ok(template);
	}

	let replaced = '';
	let lastIndex = 0;

	for(const match of template.matchAll(CAPTURE_REGEX)) {
		const [all, date, dateTemplate, git, gitProperty, token] = match;

		replaced += template.slice(lastIndex, match.index);

		if(date) {
			replaced += dayjs().format(dateTemplate);
		}
		else if(git) {
			if(!tokens.git) {
				const result = await loadGitTokens(cwd);

				if(result.fails) {
					return result;
				}

				tokens.git = result.value;
			}

			if(!GIT_PROPERTIES.includes(gitProperty)) {
				return err(`Undefined git property: ${gitProperty}`);
			}

			replaced += tokens.git![gitProperty]
		}
		else {
			replaced += tokens[token] ?? ''
		}

		lastIndex = match.index + all.length;
	}

	replaced += template.slice(lastIndex);

	return ok(replaced);
}
