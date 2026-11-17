export const ATX_HEADING_REGEX = /^(#{1,6})\s+/;
export const SETEXT_HEADING_REGEX = /^(=+|-+)\s*$/;

export function getHeadingLevel(index: number, lines: string[]): number | undefined {
	const atxMatch = ATX_HEADING_REGEX.exec(lines[index] ?? '');

	if(atxMatch) {
		return atxMatch[1].length;
	}

	if(index > 0) {
		const setextMatch = SETEXT_HEADING_REGEX.exec(lines[index] ?? '');

		if (setextMatch) {
			return setextMatch[1][0] === '=' ? 1 : 2;
		}
	}

	const nextLine = SETEXT_HEADING_REGEX.exec(lines[index + 1] ?? '');

	if(nextLine) {
		return nextLine[1][0] === '=' ? 1 : 2;
	}

	return undefined;
}
