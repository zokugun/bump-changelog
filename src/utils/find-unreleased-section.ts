export function findUnreleasedSection(unreleased: string, isATX: boolean, lines: string[]): number | undefined {
	if(isATX) {
		const heading = `## ${unreleased}`;

		for(const [index, line] of lines.entries()) {
			if(line.startsWith(heading)) {
				return index;
			}
		}
	}
	else {
		for(const [index, line] of lines.entries()) {
			if(line.startsWith(unreleased) && lines[index + 1].startsWith('---')) {
				return index;
			}
		}
	}

	return undefined;
}
