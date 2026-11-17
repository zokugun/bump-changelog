import type { Reference, SortConfig } from '#/types.js';

export function sortReferences(references: Reference[], sort: SortConfig): void {
	if(sort.mode === 'none') {
		return;
	}

	if(sort.mode === 'alphabetical') {
		const multiplier = direction(sort.direction);

		references.sort((left, right) => left.name.localeCompare(right.name, undefined, { sensitivity: 'base' }) * multiplier);

		return;
	}

	const { alpha, version } = sort.direction;

	references.sort((left, right) => {
		const [leftAlpha, leftVersion] = splitName(left.name);
		const [rightAlpha, rightVersion] = splitName(right.name);
		const alphaComparison = leftAlpha.localeCompare(rightAlpha, undefined, { sensitivity: 'base' });

		if(alphaComparison !== 0) {
			return alphaComparison * direction(alpha);
		}

		return leftVersion.localeCompare(rightVersion, undefined, { numeric: true, sensitivity: 'base' }) * direction(version);
	});
}

function direction(value: 'asc' | 'desc') {
	return value === 'desc' ? -1 : 1;
}

function splitName(value: string): [string, string] {
	const versionIndex = value.search(/\d/);

	return versionIndex < 0 ? [value, ''] : [value.slice(0, versionIndex), value.slice(versionIndex)];
}
