import { mockForInMemoryFiles, unmockForInMemoryFiles } from '@zokugun/vitest-toolkit'

mockForInMemoryFiles();

const { unrelease } = await import('#/commands/unrelease.js');

unmockForInMemoryFiles();

export { unrelease };
