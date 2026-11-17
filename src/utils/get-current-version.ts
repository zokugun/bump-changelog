import type { AsyncDResult } from '@zokugun/xtry';

import fse from '@zokugun/fs-extra-plus/async';
import { err, ok, stringifyError } from '@zokugun/xtry';
import { isNonBlankString, isRecord } from '@zokugun/is-it-type';

export async function getCurrentVersion(root: string): AsyncDResult<string> {
	const packageJsonData = await fse.readJSON(fse.join(root, 'package.json'));

	if(packageJsonData.fails) {
		return err(stringifyError(packageJsonData.error));
	}

	if(!isRecord(packageJsonData.value)) {
		return err('"package.json" isn\'t an object')
	}

	const { version } = packageJsonData.value;

	if(isNonBlankString<string>(version)) {
		return ok(version);
	}

	return err('"package.json.version" is an empty string or not a string')
}
