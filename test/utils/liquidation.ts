import {BigNumberable} from "../../tasks/lib/types";
import {boolToBytes32, combineHexStrings, bnToBytes32} from "../../tasks/lib/BytesHelper";
import BigNumber from "bignumber.js";

export function makeLiquidateTradeData(
  amount: BigNumberable,
  isBuy: boolean,
  allOrNothing: boolean,
): string {
  const amountData = bnToBytes32(amount);
  const isBuyData = boolToBytes32(isBuy);
  const allOrNothingData = boolToBytes32(allOrNothing);
  return combineHexStrings(amountData, isBuyData, allOrNothingData);
}

export function liquidate(
  maker: string,
  taker: string,
  amount: BigNumberable,
  isBuy: boolean,
  allOrNothing: boolean,
): this {
  return this.addTradeArg({
    maker,
    taker,
    data: makeLiquidateTradeData(amount, isBuy, allOrNothing),
    trader: this.contracts.p1Liquidation.options.address,
  });
}
export function addTradeArg({
    maker,
    taker,
    trader,
    data,
  }: {
  maker: string,
  taker: string,
  trader: string,
  data: string,
}): this {
  if (this.committed) {
    throw new Error('Operation already committed');
  }
  this.trades.push({
    trader,
    data,
    maker: maker.toLowerCase(),
    taker: taker.toLowerCase(),
  });
  return this;
}
