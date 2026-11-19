export function findSubSection(title: string, sectionIndex: number, isATX: boolean, lines: string[]): number | undefined {
	let index = sectionIndex + (isATX ? 1 : 2);

	const heading = `### ${title}`;

	if(isATX) {
		while(index < lines.length) {
			if(lines[index].startsWith(heading)) {
				return index;
			}

			if(lines[index].startsWith('## ')) {
				return undefined;
			}

			index += 1;
		}
	}
	else {
		while(index < lines.length) {
			if(lines[index].startsWith(heading)) {
				return index;
			}

			if(lines[index].trim().length !== 0 && lines[index + 1]?.startsWith('---')) {
				return undefined;
			}

			index += 1;
		}
	}

	return undefined;
}
