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

import { JsonRpcPayload, JsonRpcResponse } from 'web3-core-helpers';

import { Provider } from '../../src/lib/types';

export class EVM {
  private provider: Provider;

  constructor(
    provider: Provider,
  ) {
    this.provider = provider;
  }

  public setProvider(
    provider: Provider,
  ): void {
    this.provider = provider;
  }

  /**
   * Attempts to reset the EVM to its initial state. Useful for testing suites
   */
  public async resetEVM(resetSnapshotId: string = '0x1'): Promise<void> {
    const id = await this.snapshot();

    if (id !== resetSnapshotId) {
      await this.reset(resetSnapshotId);
    }
  }

  public async reset(id: string): Promise<string> {
    if (!id) {
      throw new Error('id must be set');
    }

    await this.callJsonrpcMethod('evm_revert', [id]);

    return this.snapshot();
  }

  public async snapshot(): Promise<string> {
    return this.callJsonrpcMethod('evm_snapshot');
  }

  public async evmRevert(id: string): Promise<string> {
    return this.callJsonrpcMethod('evm_revert', [id]);
  }

  public async stopMining(): Promise<string> {
    return this.callJsonrpcMethod('miner_stop');
  }

  public async startMining(): Promise<string> {
    return this.callJsonrpcMethod('miner_start');
  }

  public async mineBlock(): Promise<string> {
    return this.callJsonrpcMethod('evm_mine');
  }

  public async increaseTime(duration: number): Promise<string> {
    return this.callJsonrpcMethod('evm_increaseTime', [duration]);
  }

  public async callJsonrpcMethod(method: string, params?: (any[])): Promise<string> {
    const args: JsonRpcPayload = {
      method,
      params,
      jsonrpc: '2.0',
      id: new Date().getTime(),
    };

    const response = await this.send(args);

    return response.result;
  }

  private async send(args: JsonRpcPayload): Promise<any> {
    return new Promise((resolve, reject) => {
      const callback: any = (error: Error, val: JsonRpcResponse): void => {
        if (error) {
          reject(error);
        } else {
          resolve(val);
        }
      };

      this.provider.send(
        args,
        callback,
      );
    });
  }
}
