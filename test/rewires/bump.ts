import { mockCliFileTests, unmockCliFileTests } from '@zokugun/vitest-toolkit'

mockCliFileTests();

const { bump } = await import('#/commands/bump.js');

unmockCliFileTests();

export { bump };
