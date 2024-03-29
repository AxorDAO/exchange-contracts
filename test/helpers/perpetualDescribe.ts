/*

    Copyright 2024 Axor DAO

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

*/

import { snapshot, resetEVM, mineAvgBlock } from './EVM';
import { getPerpetual } from './Perpetual';
import { PerpetualMarket, address } from '../../src/lib/types';
import { TestPerpetual } from '../modules/TestPerpetual';

export interface ITestContext {
  perpetual?: TestPerpetual;
  accounts?: address[];
}

export type initFunction = (ctx: ITestContext) => Promise<void>;
export type testsFunction = (ctx: ITestContext) => void;

export function inversePerpetualDescribe(
  name: string,
  init: initFunction,
  tests: testsFunction,
): void {
  return perpetualDescribe(name, init, tests, PerpetualMarket.WETH_PUSD);
}

export function perpetualDescribe(
  name: string,
  init: initFunction,
  tests: testsFunction,
  market: PerpetualMarket = PerpetualMarket.PBTC_USDC,
): void {
  // Note that the function passed into describe() should not be async.
  describe(name, () => {
    const ctx: ITestContext = {};

    let preInitSnapshotId: string;
    let postInitSnapshotId: string;

    // Runs before any before() calls made within the perpetualDescribe() call.
    before(async () => {
      const { perpetual, accounts } = await getPerpetual(market);
      ctx.perpetual = perpetual;
      ctx.accounts = accounts;

      preInitSnapshotId = await snapshot();

      await init(ctx);

      // force the index to update on the next call to the perpetual
      await mineAvgBlock();

      postInitSnapshotId = await snapshot();
    });

    // Runs before any beforeEach() calls made within the perpetualDescribe() call.
    beforeEach(async () => {
      await resetEVM(postInitSnapshotId);
      ctx.perpetual.contracts.resetGasUsed();
    });

    // Runs before any after() calls made within the perpetualDescribe() call.
    after(async () => {
      await resetEVM(preInitSnapshotId);
    });

    // Runs before any afterEach() calls made within the perpetualDescribe() call.
    afterEach(() => {
      // Output the gas used in each test case.
      for (const { gasUsed, name } of ctx.perpetual.contracts.getGasUsedByFunction()) {
        const label = (`${name}:`).padEnd(20, ' ');
        printGasUsage(label, `${gasUsed}`.padStart(9, ' '));
      }
    });

    tests(ctx);
  });
}

function printGasUsage(label: string, value: number | string): void {
  console.log(`\t\t\x1b[33m${label} \x1b[93m${value}\x1b[0m`);
}
