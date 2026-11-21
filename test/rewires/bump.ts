import { mockForInMemoryFiles, unmockForInMemoryFiles } from '@zokugun/vitest-toolkit'

mockForInMemoryFiles();

const { bump } = await import('#/commands/bump.js');

unmockForInMemoryFiles();

export { bump };
