import { Command } from '@zokugun/cli-utils/commander';
import pkg from '../package.json' with { type: 'json' };
import { run } from './run.js';

const program = new Command();

program
	.version(pkg.version, '-v, --version')
	.description(pkg.description)
	.option('-n, --new <version>', 'The new version')
	.option('-o, --old <version>', 'The old version')
	.action(run)
	.parse();
