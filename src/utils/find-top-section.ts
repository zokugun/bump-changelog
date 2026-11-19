export function findTopSection(isATX: boolean, lines: string[]): number | undefined {
	if(isATX) {
		const heading = `## `;

		for(const [index, line] of lines.entries()) {
			if(line.startsWith(heading)) {
				return index;
			}
		}
	}
	else {
		for(const [index, line] of lines.entries()) {
			if(line.trim().length !== 0 && lines[index + 1].startsWith('---')) {
				return index;
			}
		}
	}

	return undefined;
}
