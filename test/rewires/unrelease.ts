import { mockCliFileTests, unmockCliFileTests } from '@zokugun/vitest-toolkit'

mockCliFileTests();

const { unrelease } = await import('#/commands/unrelease.js');

unmockCliFileTests();

export { unrelease };
