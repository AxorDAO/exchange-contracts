import BigNumber from 'bignumber.js';

import { expectBN } from './Expect';
import { INTEGERS } from '../../src/lib/Constants';
import { address, Balance, BigNumberable, TxResult } from '../../src/lib/types';
import { Signature, Wallet, parseEther, AbiCoder } from "ethers";

/**
 * Mint test token to an account and deposit it in the perpetual.
 */
export async function mintAndDeposit(
    wallet: Wallet,
    from: address,
    account: address,
    amount: BigNumberable,
    price: BigNumberable,
    settlementAmounts: BigNumberable,
    settlementIsPositives: boolean,
  ): Promise<void> {
    
  }