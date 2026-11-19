
export function addLogEntry(message: string, index: number, isATX: boolean, lines: string[]): void {
	if(lines[index].trim().length === 0) {
		index += 1;
	}

	if(isATX) {
		while(index < lines.length) {
			if(lines[index].trim().length == 0 || lines[index].startsWith('## ')) {
				break;
			}

			index += 1;
		}
	}
	else {
		while(index < lines.length) {
			if(lines[index].trim().length == 0 || lines[index + 1]?.startsWith('---')) {
				break;
			}

			index += 1;
		}
	}

	lines.splice(index, 0, `- ${message}`);
}
