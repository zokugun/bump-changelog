import { mockCliFileTests, unmockCliFileTests } from '@zokugun/vitest-toolkit'

mockCliFileTests();

const { run } = await import('#/run.js');

unmockCliFileTests();

export { run };
