import { Command } from '@zokugun/cli-utils/commander';

import pkg from '../package.json' with { type: 'json' };
import { bump } from './commands/bump.js';
import { unrelease } from './commands/unrelease.js';

const program = new Command();

program
	.version(pkg.version, '-v, --version')
	.description(pkg.description);

program
	.command('bump')
	.description('bump changelog')
	.option('-n, --new <version>', 'The new version')
	.option('-o, --old <version>', 'The old version')
	.action(bump);

program
	.command('unrelease')
	.description('add an unrelease log')
	.option('-a, --added', 'add an Added log')
	.option('-b, --breaking', 'add a Breaking log')
	.option('-c, --changed', 'add a Changed log')
	.option('-f, --fixed', 'add a Fixed log')
	.option('-m, --maintenance', 'add a Maintenance log')
	.option('-r, --removed', 'add a Removed log')
	.argument('[message]', 'the message of the new entry')
	.action(unrelease);

program.parse();
