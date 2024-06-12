// import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
// import { HardhatEthersProvider } from "@nomicfoundation/hardhat-ethers/internal/hardhat-ethers-provider";
// import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
// import assert from "assert";
// import BigNumber from "bignumber.js";
// import { expect } from "chai";
// import {Signature, Wallet, parseEther, AbiCoder} from "ethers";
// import { ethers } from "hardhat";
// import Web3 from "web3";

// import { INTEGERS, PRICES } from "../../tasks/lib/Constants";
// import { signatureToSolidityStruct } from "../../tasks/lib/SignatureHelper";
// import { Balance, Fee, Order, Price, SigningMethod, TradeArg } from "../../tasks/lib/types";
// import { Orders } from "../../tasks/utils/Orders";
// import { deployTestPerpetualFixture } from "../fixtures/perpetual.fixture";
// import type { Signers } from "../types";
// import { getSignedOrder } from "../utils/order";
// import {ABI} from "@openzeppelin/upgrades";
// import {buy} from "../helpers/trade";
// import {ITestContext} from "../helpers/perpetualDescribe";

// describe("Perpetual", function () {
//   before(async function () {
//     this.signers = {} as Signers;

//     const signers = await ethers.getSigners();
//     this.signers.admin = signers[0];
//     this.signers.admin1 = signers[1];
//     this.signers.admin2 = signers[2];

//     this.loadFixture = loadFixture;
//   });
  
//   describe("Deployment", function () {
//     async function mintAndDeposit(self: any, wallet: any) {
//       await self.test_Token.connect(wallet).mint(wallet.address, "100000e6");
//       await self.test_Token.connect(wallet).approve(await self.perpetualV1.getAddress(), "100000e6");
//       await self.perpetualV1.connect(wallet).deposit(wallet.address, wallet.address, "10e6", "30e6", 0, true);

//       const balance = await self.perpetualV1.getAccountBalance(wallet.address);
//       console.log("🚀 ~ file: perpetual.spec.ts:39 ~ mintAndDeposit ~ balance:", wallet.address, balance);
//     }

//     async function mintAndDepositWithAmount(self: any, wallet: any, amount: BigNumber) {
//       await self.test_Token.connect(wallet).mint(wallet.address, parseEther(amount.toString()));
//       await self.test_Token.connect(wallet).approve(await self.perpetualV1.getAddress(),  parseEther(amount.toString()));
//       await self.perpetualV1.connect(wallet).deposit(wallet.address,  parseEther(amount.toString()), "30e6", 0, true);

//       const balance = await self.perpetualV1.getAccountBalance(wallet.address);
//       console.log("🚀 ~ file: perpetual.spec.ts:39 ~ mintAndDeposit ~ balance:", wallet.address, balance);
//     }

//     beforeEach(async function () {
//     //   const {
//     //     test_Lib,
//     //     test_P1Funder,
//     //     test_P1Oracle,
//     //     test_P1Trader,
//     //     test_Token,
//     //     test_Token2,
//     //     test_MakerOracle,
//     //     test_ChainlinkAggregator,
//     //     perpetualV1Impl,
//     //     perpetualV1,
//     //     p1FundingOracle,
//     //     p1ChainlinkOracle,
//     //     p1MakerOracle,
//     //     p1Orders,
//     //     p1Liquidation,
//     //     p1LiquidatorProxy,
//     //   } = await this.loadFixture(deployTestPerpetualFixture);
//     //   this.test_Lib = test_Lib;
//     //   this.test_P1Funder = test_P1Funder;
//     //   this.test_P1Oracle = test_P1Oracle;
//     //   this.test_P1Trader = test_P1Trader;
//     //   this.test_Token = test_Token;
//     //   this.test_Token2 = test_Token2;
//     //   this.test_MakerOracle = test_MakerOracle;
//     //   this.test_ChainlinkAggregator = test_ChainlinkAggregator;
//     //   this.perpetualV1Impl = perpetualV1Impl;
//     //   this.perpetualV1 = perpetualV1;
//     //   this.p1FundingOracle = p1FundingOracle;
//     //   this.p1ChainlinkOracle = p1ChainlinkOracle;
//     //   this.p1MakerOracle = p1MakerOracle;
//     //   this.p1Orders = p1Orders;
//     //   this.p1Liquidation = p1Liquidation;
//     //   this.p1LiquidatorProxy = p1LiquidatorProxy;
//     // });

//     // it("Able to deposit", async function () {
//     //   await this.test_Token.mint(this.signers.admin.address, parseEther("1000"));
//     //   console.log("🚀 ~ file: perpetual.ts:70 ~ this.signers.admin.address:", this.signers.admin.address);
//     //   console.log("🚀 ~ file: perpetual.ts:72 ~ this.perpetualV1.address:", this.perpetualV1.target);
//     //   console.log("🚀 ~ file: perpetual.ts:75 ~ this.signers.admin.address:", this.signers.admin.address);
//     //   await this.test_Token.approve(await this.perpetualV1.getAddress(), parseEther("1000"));
//     //   await this.test_MakerOracle.setPrice(parseEther("1"));
//     //   await this.perpetualV1.deposit(this.signers.admin.address, this.signers.admin.address, parseEther("10"), "300000000", "0", true);
//     // });

//     // it("Able to trade", async function () {
//     //   const orderAmount = new BigNumber("1e18");
//     //   const limitPrice = new Price("1");
//     //   const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
//     //   const orderUtils = new Orders(1337, web3, await this.p1Orders.getAddress());

//     //   await this.test_MakerOracle.setPrice("30e6");
//     //   await mintAndDeposit(this, this.signers.admin);
//     //   await mintAndDeposit(this, this.signers.admin1);
//     //   await mintAndDeposit(this, this.signers.admin2);

//     //   // create order
//     //   const defaultOrder: Order = {
//     //     limitPrice,
//     //     isBuy: true,
//     //     isDecreaseOnly: false,
//     //     amount: orderAmount,
//     //     triggerPrice: PRICES.NONE,
//     //     limitFee: Fee.fromBips(0),
//     //     maker: this.signers.admin1.address,
//     //     taker: this.signers.admin.address,
//     //     expiration: INTEGERS.ONE_YEAR_IN_SECONDS.times(100),
//     //     salt: new BigNumber("425"),
//     //   };
//     //   const defaultOrder1: Order = {
//     //     limitPrice,
//     //     isBuy: false,
//     //     isDecreaseOnly: false,
//     //     amount: orderAmount,
//     //     triggerPrice: PRICES.NONE,
//     //     limitFee: Fee.fromBips(0),
//     //     maker: this.signers.admin2.address,
//     //     taker: this.signers.admin.address,
//     //     expiration: INTEGERS.ONE_YEAR_IN_SECONDS.times(100),
//     //     salt: new BigNumber("4252"),
//     //   };

//     //   const signedOrderEthers = await orderUtils.signOrderEthers(
//     //     defaultOrder,
//     //     this.signers.admin1 as unknown as Wallet,
//     //     SigningMethod.TypedData,
//     //   );
//     //   const signedOrder1Ethers = await orderUtils.signOrderEthers(
//     //     defaultOrder1,
//     //     this.signers.admin2 as unknown as Wallet,
//     //     SigningMethod.TypedData,
//     //   );
//     //   console.log("🚀 ~ file: perpetual.spec.ts:111 ~ signedOrderEthers:", signedOrderEthers);
//     //   // split to v, r, s
//     //   const sig = signatureToSolidityStruct(signedOrderEthers);
//     //   console.log("🚀 ~ file: perpetual.spec.ts:111 ~ sig:", sig);

//     //   const tradeData = orderUtils.fillToTradeData(
//     //     {
//     //       ...defaultOrder,
//     //       typedSignature: signedOrderEthers,
//     //     },
//     //     orderAmount,
//     //     limitPrice,
//     //     defaultOrder.limitFee,
//     //   );
//     //   const tradeData1 = orderUtils.fillToTradeData(
//     //     {
//     //       ...defaultOrder1,
//     //       typedSignature: signedOrder1Ethers,
//     //     },
//     //     orderAmount,
//     //     limitPrice,
//     //     defaultOrder.limitFee,
//     //   );
//     //   const tradeArgs: TradeArg[] = [
//     //     {
//     //       makerIndex: 1,
//     //       takerIndex: 2,
//     //       trader: await this.p1Orders.getAddress(),
//     //       data: tradeData,
//     //     },
//     //     {
//     //       makerIndex: 0,
//     //       takerIndex: 2,
//     //       trader: await this.p1Orders.getAddress(),
//     //       data: tradeData1,
//     //     },
//     //   ];
//     //   console.log(
//     //     "\x1b[36m%s\x1b[0m",
//     //     "this.signers.admin.address, this.signers.admin1.address, this.signers.admin1.address",
//     //     this.signers.admin.address,
//     //     this.signers.admin1.address,
//     //     this.signers.admin2.address,
//     //   );
//     //   const accounts: string[] = [this.signers.admin.address, this.signers.admin1.address, this.signers.admin2.address]
//     //     .map((e) => e.toLowerCase())
//     //     .sort();
//     //   console.log("🚀 ~ file: perpetual.spec.ts:132 ~ accounts:", accounts);

//     //   await this.perpetualV1.connect(this.signers.admin).trade(accounts, tradeArgs);

//     //   for (const wallet of [this.signers.admin, this.signers.admin1, this.signers.admin2]) {
//     //     console.log("\x1b[36m%s\x1b[0m", "==========================");
//     //     const balance = await this.perpetualV1.getAccountBalance(wallet.address);
//     //     console.log("🚀 ~ file: perpetual.spec.ts:39 ~ mintAndDeposit ~ balance:", wallet.address, balance);
//     //     const balanceIns = new Balance(
//     //       new BigNumber(balance[0] ? balance[2].toString() : "-" + balance[2].toString()),
//     //       new BigNumber(balance[1] ? balance[3].toString() : "-" + balance[3].toString()),
//     //     );
//     //     const { positiveValue, negativeValue } = balanceIns.getPositiveAndNegativeValues(new Price("10"));
//     //     console.log("🚀 ~ file: perpetual.spec.ts:202 ~ negativeValue:", negativeValue.toString());
//     //     console.log("🚀 ~ file: perpetual.spec.ts:202 ~ positiveValue:", positiveValue.toString());
//     //   }
//     // });
//     // it("Able to liquidity", async function () {
//     //   const orderAmount = new BigNumber("1e19");
//     //   const limitPrice = new Price(100);
//     //   const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
//     //   const orderUtils = new Orders(1337, web3, await this.p1Orders.getAddress());

//     //   const initialPrice = new Price(100);
//     //   const longBorderlinePrice = new Price(55);
//     //   const longUndercollateralizedPrice = new Price('54.999999');
//     //   const longUnderwaterPrice = new Price('49.999999');
//     //   const shortBorderlinePrice = new Price('136.363636');
//     //   const shortUndercollateralizedPrice = new Price('136.363637');
//     //   const shortUnderwaterPrice = new Price('150.000001');
//     //   const positionSize = new BigNumber(10);
//     //   const cost = new BigNumber(1000);
//     //   const TRADER_FLAG_ORDERS = new BigNumber(1);
//     //   const maker = this.signers.admin1;
//     //   const taker = this.signers.admin;


//     //   await this.test_MakerOracle.setPrice(limitPrice.toSolidity());
//     //   await mintAndDepositWithAmount(this, maker, new BigNumber(500));
//     //   await mintAndDepositWithAmount(this, taker, new BigNumber(500));
//     //   // await buy(this as ITestContext, this.signers.admin1, this.signers.admin2, positionSize, cost);
//     //   // create order

//     //   // await this.test.p1Trader.trader.setTradeResult({
//     //   //   isBuy,
//     //   //   marginAmount: new BigNumber(cost),
//     //   //   positionAmount: new BigNumber(position),
//     //   //   traderFlags: TRADER_FLAG_ORDERS,
//     //   // });

//     //   const defaultOrder: Order = {
//     //     limitPrice,
//     //     isBuy: true,
//     //     isDecreaseOnly: false,
//     //     amount: orderAmount,
//     //     triggerPrice: PRICES.NONE,
//     //     limitFee: Fee.fromBips(0),
//     //     maker: maker.address,
//     //     taker: this.signers.admin.address,
//     //     expiration: INTEGERS.ONE_YEAR_IN_SECONDS.times(100),
//     //     salt: new BigNumber("425"),
//     //   };

//     //   const signedOrderEthers = await orderUtils.signOrderEthers(
//     //     defaultOrder,
//     //     maker as unknown as Wallet,
//     //     SigningMethod.TypedData,
//     //   );

//     //   const accounts: string[] = [this.signers.admin.address, this.signers.admin1.address, this.signers.admin2.address]
//     //     .map((e) => e.toLowerCase())
//     //     .sort();
//     //   console.log("🚀 ~ file: perpetual.spec.ts:132 ~ accounts:", accounts);

//     //   const sig = signatureToSolidityStruct(signedOrderEthers);
//     //   console.log("🚀 ~ file: perpetual.spec.ts:111 ~ sig:", sig);

//     //   const tradeData = orderUtils.fillToTradeData(
//     //     {
//     //       ...defaultOrder,
//     //       typedSignature: signedOrderEthers,
//     //     },
//     //     orderAmount,
//     //     limitPrice,
//     //     defaultOrder.limitFee,
//     //   );

//     //   const tradeArgsTrade: TradeArg[] = [
//     //     {
//     //       makerIndex: accounts.indexOf(maker.address.toLowerCase()),
//     //       takerIndex: accounts.indexOf(taker.address.toLowerCase()),
//     //       trader: await this.p1Orders.getAddress(),
//     //       data: tradeData,
//     //     }
//     //   ];
//     //   console.log(
//     //     "\x1b[36m%s\x1b[0m",
//     //     "this.signers.admin.address, this.signers.admin1.address, this.signers.admin1.address",
//     //     this.signers.admin.address,
//     //     this.signers.admin1.address,
//     //     this.signers.admin2.address,
//     //   );


//     //   await this.perpetualV1.connect(this.signers.admin).trade(accounts, tradeArgsTrade);

//     //   // console.log(
//     //   //   "\x1b[36m%s\x1b[0m",
//     //   //   "this.signers.admin.address, this.signers.admin1.address, this.signers.admin1.address",
//     //   //   this.signers.admin.address,
//     //   //   maker.address,
//     //   //   taker.address,
//     //   // );
//     //   //
//     //   // await this.perpetualV1.connect(this.signers.admin).trade(accounts, tradeArgsTrade);
//     //   //
//     //   //
//     //   await this.test_MakerOracle.setPrice(longUndercollateralizedPrice.toSolidity());
//     //   const liquidationAmount = orderAmount.div(2);

//     //   const liquidateDate = {
//     //     amount: liquidationAmount,
//     //     isBuy: true,
//     //     allOrNothing: false
//     //   }

//     //   const tradeArgs: TradeArg[] = [
//     //     {
//     //       makerIndex: accounts.indexOf(maker.address.toLowerCase()),
//     //       takerIndex: accounts.indexOf(taker.address.toLowerCase()),
//     //       trader: await this.p1Liquidation.getAddress(),
//     //       data: orderUtils.tradeDataLiquidationEncode(liquidateDate.amount, liquidateDate.isBuy, liquidateDate.allOrNothing),
//     //     },
//     //   ];

//     //   await this.perpetualV1.connect(this.signers.admin).trade(
//     //     accounts,
//     //     tradeArgs
//     //   );
//     // });
//   })

// })
