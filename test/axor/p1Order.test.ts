import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { HardhatEthersProvider } from "@nomicfoundation/hardhat-ethers/internal/hardhat-ethers-provider";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import assert from "assert";
import BigNumber from "bignumber.js";
import { expect } from "chai";
import { Signature, Wallet, parseEther, AbiCoder, parseUnits } from "ethers";
import { ethers } from "hardhat";
import Web3 from "web3";
import { address, BaseValue, Balance, Price } from '../../src/lib/types';

import { INTEGERS, PRICES } from "../../tasks/lib/Constants";
import { signatureToSolidityStruct } from "../../tasks/lib/SignatureHelper";
import { Balance, Fee, Order, Price, SigningMethod, TradeArg } from "../../tasks/lib/types";
import { Orders } from "../../tasks/utils/Orders";
import { deployTestPerpetualFixture } from "../fixtures/perpetual.fixture";
import type { Signers } from "../types";
import { getSignedOrder } from "../utils/order";
import { ABI } from "@openzeppelin/upgrades";
import { buy } from "../helpers/trade";
import { ITestContext } from "../helpers/perpetualDescribe";
import { HardhatRuntimeEnvironment as hre } from "hardhat/types";
import { mineNBlocks } from "../helpers/balances";

import {
  P1ChainlinkOracle,
  P1ChainlinkOracle__factory,
  P1FundingOracle,
  P1FundingOracle__factory,
  P1Liquidation,
  P1Liquidation__factory,
  P1LiquidatorProxy,
  P1LiquidatorProxy__factory,
  P1MakerOracle,
  P1MakerOracle__factory,
  P1Orders,
  P1Orders__factory,
  PerpetualProxy,
  PerpetualProxy__factory,
  PerpetualV1,
  PerpetualV1__factory,
  Test_ChainlinkAggregator,
  Test_ChainlinkAggregator__factory,
  Test_Lib,
  Test_Lib__factory,
  Test_MakerOracle,
  Test_MakerOracle__factory,
  Test_P1Funder,
  Test_P1Funder__factory,
  Test_P1Oracle,
  Test_P1Oracle__factory,
  Test_P1Trader,
  Test_P1Trader__factory,
  Test_Token,
  Test_Token2,
  Test_Token2__factory,
  Test_Token__factory,
} from "../../types";
import { mintAndDeposit } from "../helpers/balances";
import Provider from "../helpers/Provider";

describe("P1Order", function () {
  let listContracts: any[] = [];
  let test_Lib: Test_Lib;
  let test_P1Funder: Test_P1Funder;
  let test_P1Oracle: Test_P1Oracle;
  let test_P1Trader: Test_P1Trader;
  let test_Token: Test_Token;
  let test_Token2: Test_Token2;
  let test_MakerOracle: Test_MakerOracle;
  let test_ChainlinkAggregator: Test_ChainlinkAggregator;
  let perpetualV1Impl: PerpetualV1;
  let perpetualV1: PerpetualV1;
  let p1FundingOracle: P1FundingOracle;
  let p1ChainlinkOracle: P1ChainlinkOracle;
  let p1MakerOracle: P1MakerOracle;
  let p1Orders: P1Orders;
  let p1Liquidation: P1Liquidation;
  let p1LiquidatorProxy: P1LiquidatorProxy;

  let admin: Wallet;
  let bob: Wallet;
  let alice: Wallet;

  const orderAmount = new BigNumber("1e18");
  const limitPrice = new Price("1");
  const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

  before(async function () {
    this.signers = {} as Signers;

    const signers = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.admin1 = signers[1];
    this.signers.admin2 = signers[2];
    admin = signers[0];
    bob = signers[10];
    alice = signers[11];

    this.loadFixture = loadFixture;

    const {
      _test_Lib,
      _test_P1Funder,
      _test_P1Oracle,
      _test_P1Trader,
      _test_Token,
      _test_Token2,
      _test_MakerOracle,
      _test_ChainlinkAggregator,
      _perpetualV1Impl,
      _perpetualV1,
      _p1FundingOracle,
      _p1ChainlinkOracle,
      _p1MakerOracle,
      _p1Orders,
      _p1Liquidation,
      _p1LiquidatorProxy,
    } = await this.loadFixture(deployTestPerpetualFixture);
    this.test_Lib = _test_Lib;
    this.test_P1Funder = _test_P1Funder;
    this.test_P1Oracle = _test_P1Oracle;
    this.test_P1Trader = _test_P1Trader;
    this.test_Token = _test_Token;
    this.test_Token2 = _test_Token2;
    this.test_MakerOracle = _test_MakerOracle;
    this.test_ChainlinkAggregator = _test_ChainlinkAggregator;
    this.perpetualV1Impl = _perpetualV1Impl;
    this.perpetualV1 = _perpetualV1;
    this.p1FundingOracle = _p1FundingOracle;
    this.p1ChainlinkOracle = _p1ChainlinkOracle;
    this.p1MakerOracle = _p1MakerOracle;
    this.p1Orders = _p1Orders;
    this.p1Liquidation = _p1Liquidation;
    this.p1LiquidatorProxy = _p1LiquidatorProxy;
    test_Lib = _test_Lib;
    test_P1Funder = _test_P1Funder;
    test_P1Oracle = _test_P1Oracle;
    test_P1Trader = _test_P1Trader;
    test_Token = _test_Token;
    test_Token2 = _test_Token2;
    test_MakerOracle = _test_MakerOracle;
    test_ChainlinkAggregator = _test_ChainlinkAggregator;
    perpetualV1Impl = _perpetualV1Impl;
    perpetualV1 = _perpetualV1;
    p1FundingOracle = _p1FundingOracle;
    p1ChainlinkOracle = _p1ChainlinkOracle;
    p1MakerOracle = _p1MakerOracle;
    p1Orders = _p1Orders;
    p1Liquidation = _p1Liquidation;
    p1LiquidatorProxy = _p1LiquidatorProxy;
  });

  describe('trade', () => {
    it('init', async () => {
      await test_MakerOracle.setPrice(parseUnits("22", 'kwei'));
      const adminBalanceTest = parseEther("1000");
      await test_Token.connect(admin).mint(admin.address, adminBalanceTest);
      await test_Token.connect(admin).approve(perpetualV1.target, adminBalanceTest);
      await perpetualV1.deposit(
        admin.address,
        admin.address,
        adminBalanceTest,
        0,
        0,
        true
      )
    });
    it('able to trade', async () => {
      const orderUtils = new Orders(1337, web3, await p1Orders.getAddress());
      const bobOrder: Order = {
        limitPrice,
        isBuy: true,
        isDecreaseOnly: false,
        amount: orderAmount,
        triggerPrice: PRICES.NONE,
        limitFee: Fee.fromBips(0),
        maker: bob.address,
        taker: admin.address,
        expiration: INTEGERS.ONE_YEAR_IN_SECONDS.times(100),
        salt: new BigNumber("425"),
      };

      const aliceOrder: Order = {
        limitPrice,
        isBuy: false,
        isDecreaseOnly: false,
        amount: orderAmount,
        triggerPrice: PRICES.NONE,
        limitFee: Fee.fromBips(0),
        maker: alice.address,
        taker: admin.address,
        expiration: INTEGERS.ONE_YEAR_IN_SECONDS.times(100),
        salt: new BigNumber("4252"),
      };

      const bobSignedOrder = await orderUtils.signOrderEthers(
        bobOrder,
        bob as unknown as Wallet,
        SigningMethod.TypedData,
      );
      const aliceSignedOrder = await orderUtils.signOrderEthers(
        aliceOrder,
        alice as unknown as Wallet,
        SigningMethod.TypedData,
      );
      const bobTradeData = orderUtils.fillToTradeData(
        {
          ...bobOrder,
          typedSignature: bobSignedOrder,
        },
        orderAmount,
        limitPrice,
        bobOrder.limitFee,
      );

      const aliceTradeData = orderUtils.fillToTradeData(
        {
          ...aliceOrder,
          typedSignature: aliceSignedOrder,
        },
        orderAmount,
        limitPrice,
        aliceOrder.limitFee,
      );

      const accounts: string[] = [bob.address, alice.address, admin.address]
        .map((e) => e.toLowerCase())
        .sort();
      
      const indexs = {};
      for (let i = 0; i < accounts.length; i++) {
        indexs[accounts[i]] = i;
      }
      const tradeArgs: TradeArg[] = [
        {
          makerIndex: indexs[bob.address.toLowerCase()],
          takerIndex: indexs[admin.address.toLowerCase()],
          trader: await p1Orders.getAddress(),
          data: bobTradeData,
        },
        {
          makerIndex: indexs[alice.address.toLowerCase()],
          takerIndex: indexs[admin.address.toLowerCase()],
          trader: await p1Orders.getAddress(),
          data: aliceTradeData,
        },
      ];

      const bobBalance = await perpetualV1.getAccountBalance(bob.address);
      console.log("🚀 ~ it ~ bobBalance:", bobBalance)

      await perpetualV1.trade(accounts, tradeArgs, ["0", "0", "0"], [true, true, true], "10000000000000000");
      // const bobBalance = await perpetualV1.getAccountBalance(bob.address);
      // console.log("🚀 ~ it ~ bobBalance:", bobBalance)
    });

    it('able to trade with valid price', async () => {
      const orderUtils = new Orders(1337, web3, await p1Orders.getAddress());
      const bobOrder: Order = {
        limitPrice,
        isBuy: true,
        isDecreaseOnly: false,
        amount: orderAmount,
        triggerPrice: PRICES.NONE,
        limitFee: Fee.fromBips(0),
        maker: bob.address,
        taker: admin.address,
        expiration: INTEGERS.ONE_YEAR_IN_SECONDS.times(100),
        salt: new BigNumber("426"),
      };

      const aliceOrder: Order = {
        limitPrice: limitPrice.minus("1000000"),
        isBuy: false,
        isDecreaseOnly: false,
        amount: orderAmount,
        triggerPrice: PRICES.NONE,
        limitFee: Fee.fromBips(0),
        maker: alice.address,
        taker: admin.address,
        expiration: INTEGERS.ONE_YEAR_IN_SECONDS.times(100),
        salt: new BigNumber("42522"),
      };

      const bobSignedOrder = await orderUtils.signOrderEthers(
        bobOrder,
        bob as unknown as Wallet,
        SigningMethod.TypedData,
      );
      const aliceSignedOrder = await orderUtils.signOrderEthers(
        aliceOrder,
        alice as unknown as Wallet,
        SigningMethod.TypedData,
      );

      const bobTradeData = orderUtils.fillToTradeData(
        {
          ...bobOrder,
          typedSignature: bobSignedOrder,
        },
        orderAmount,
        limitPrice,
        bobOrder.limitFee,
      );

      const aliceTradeData = orderUtils.fillToTradeData(
        {
          ...aliceOrder,
          typedSignature: aliceSignedOrder,
        },
        orderAmount,
        limitPrice.minus("1000000"),
        aliceOrder.limitFee,
      );

      const accounts: string[] = [bob.address, alice.address, admin.address]
        .map((e) => e.toLowerCase())
        .sort();
      
        const indexs = {};
        for (let i = 0; i < accounts.length; i++) {
          indexs[accounts[i]] = i;
        }
        const tradeArgs: TradeArg[] = [
          {
            makerIndex: indexs[bob.address.toLowerCase()],
            takerIndex: indexs[admin.address.toLowerCase()],
            trader: await p1Orders.getAddress(),
            data: bobTradeData,
          },
          {
            makerIndex: indexs[alice.address.toLowerCase()],
            takerIndex: indexs[admin.address.toLowerCase()],
            trader: await p1Orders.getAddress(),
            data: aliceTradeData,
          },
        ];

      await perpetualV1.trade(accounts, tradeArgs, ["0", "0", "0"], [true, true, true], "10000000000000000");

    });

    it('cannot to trade with invalid maker', async () => {
      const orderUtils = new Orders(1337, web3, await p1Orders.getAddress());
      const aliceOrder: Order = {
        limitPrice: limitPrice,
        isBuy: false,
        isDecreaseOnly: false,
        amount: orderAmount,
        triggerPrice: PRICES.NONE,
        limitFee: Fee.fromBips(0),
        maker: alice.address,
        taker: admin.address,
        expiration: INTEGERS.ONE_YEAR_IN_SECONDS.times(100),
        salt: new BigNumber("1"),
      };
      const aliceSignedOrder = await orderUtils.signOrderEthers(
        aliceOrder,
        alice as unknown as Wallet,
        SigningMethod.TypedData,
      );



      const aliceTradeData = orderUtils.fillToTradeData(
        {
          ...aliceOrder,
          typedSignature: aliceSignedOrder,
        },
        orderAmount,
        limitPrice,
        aliceOrder.limitFee,
      );

      const accounts: string[] = [bob.address, alice.address, admin.address]
        .map((e) => e.toLowerCase())
        .sort();
      
      const indexs = {};

      for (let i = 0; i < accounts.length; i++) {
        indexs[accounts[i]] = i;
      }
      const tradeArgs: TradeArg[] = [
        {
          makerIndex: indexs[bob.address.toLowerCase()],
          takerIndex: indexs[admin.address.toLowerCase()],
          trader: await p1Orders.getAddress(),
          data: aliceTradeData,
        },
      ];
      try {
        await perpetualV1.trade(accounts, tradeArgs, ["0", "0", "0"], [true, true, true], "10000000000000000");

      } catch (error) {
        expect(error.message).to.be.equal(`VM Exception while processing transaction: reverted with reason string 'Order maker does not match maker'`);
      }
    });

    it('cannot to trade with invalid taker', async () => {
      const orderUtils = new Orders(1337, web3, await p1Orders.getAddress());
      const aliceOrder: Order = {
        limitPrice: limitPrice,
        isBuy: false,
        isDecreaseOnly: false,
        amount: orderAmount,
        triggerPrice: PRICES.NONE,
        limitFee: Fee.fromBips(0),
        maker: alice.address,
        taker: admin.address,
        expiration: INTEGERS.ONE_YEAR_IN_SECONDS.times(100),
        salt: new BigNumber("1"),
      };
      const aliceSignedOrder = await orderUtils.signOrderEthers(
        aliceOrder,
        alice as unknown as Wallet,
        SigningMethod.TypedData,
      );



      const aliceTradeData = orderUtils.fillToTradeData(
        {
          ...aliceOrder,
          typedSignature: aliceSignedOrder,
        },
        orderAmount,
        limitPrice,
        aliceOrder.limitFee,
      );

      const accounts: string[] = [bob.address, alice.address, admin.address]
        .map((e) => e.toLowerCase())
        .sort();
      
      const indexs = {};

      for (let i = 0; i < accounts.length; i++) {
        indexs[accounts[i]] = i;
      }
      const tradeArgs: TradeArg[] = [
        {
          makerIndex: indexs[alice.address.toLowerCase()],
          takerIndex: indexs[bob.address.toLowerCase()],
          trader: await p1Orders.getAddress(),
          data: aliceTradeData,
        },
      ];
      try {
        await perpetualV1.trade(accounts, tradeArgs, ["0", "0", "0"], [true, true, true], "10000000000000000");

      } catch (error) {
        expect(error.message).to.be.equal(`VM Exception while processing transaction: reverted with reason string 'Order taker does not match taker'`);
      }
    });

    it('cannot to trade with expired', async () => {
      const orderUtils = new Orders(1337, web3, await p1Orders.getAddress());
      const aliceOrder: Order = {
        limitPrice: limitPrice,
        isBuy: false,
        isDecreaseOnly: false,
        amount: orderAmount,
        triggerPrice: PRICES.NONE,
        limitFee: Fee.fromBips(0),
        maker: alice.address,
        taker: admin.address,
        expiration: new BigNumber("1"),
        salt: new BigNumber("1"),
      };
      const aliceSignedOrder = await orderUtils.signOrderEthers(
        aliceOrder,
        alice as unknown as Wallet,
        SigningMethod.TypedData,
      );



      const aliceTradeData = orderUtils.fillToTradeData(
        {
          ...aliceOrder,
          typedSignature: aliceSignedOrder,
        },
        orderAmount,
        limitPrice,
        aliceOrder.limitFee,
      );

      const accounts: string[] = [bob.address, alice.address, admin.address]
        .map((e) => e.toLowerCase())
        .sort();
      
      const indexs = {};

      for (let i = 0; i < accounts.length; i++) {
        indexs[accounts[i]] = i;
      }
      const tradeArgs: TradeArg[] = [
        {
          makerIndex: indexs[alice.address.toLowerCase()],
          takerIndex: indexs[admin.address.toLowerCase()],
          trader: await p1Orders.getAddress(),
          data: aliceTradeData,
        },
      ];
      try {
        await perpetualV1.trade(accounts, tradeArgs, ["0", "0", "0"], [true, true, true], "10000000000000000");

      } catch (error) {
        expect(error.message).to.be.equal(`VM Exception while processing transaction: reverted with reason string 'Order has expired'`);
      }
    });

    it('cannot to trade with invalid fill price', async () => {
      const orderUtils = new Orders(1337, web3, await p1Orders.getAddress());
      const aliceOrder: Order = {
        limitPrice: limitPrice,
        isBuy: false,
        isDecreaseOnly: false,
        amount: orderAmount,
        triggerPrice: PRICES.NONE,
        limitFee: Fee.fromBips(0),
        maker: alice.address,
        taker: admin.address,
        expiration: INTEGERS.ONE_YEAR_IN_SECONDS.times(1000),
        salt: new BigNumber("2"),
      };
      const aliceSignedOrder = await orderUtils.signOrderEthers(
        aliceOrder,
        alice as unknown as Wallet,
        SigningMethod.TypedData,
      );



      const aliceTradeData = orderUtils.fillToTradeData(
        {
          ...aliceOrder,
          typedSignature: aliceSignedOrder,
        },
        orderAmount,
        new Price("0.2"),
        aliceOrder.limitFee,
      );

      const accounts: string[] = [bob.address, alice.address, admin.address]
        .map((e) => e.toLowerCase())
        .sort();
      
      const indexs = {};

      for (let i = 0; i < accounts.length; i++) {
        indexs[accounts[i]] = i;
      }
      const tradeArgs: TradeArg[] = [
        {
          makerIndex: indexs[alice.address.toLowerCase()],
          takerIndex: indexs[admin.address.toLowerCase()],
          trader: await p1Orders.getAddress(),
          data: aliceTradeData,
        },
      ];
      try {
        await perpetualV1.trade(accounts, tradeArgs, ["0", "0", "0"], [true, true, true], "2000000000000000000");

      } catch (error) {
        expect(error.message).to.be.equal(`VM Exception while processing transaction: reverted with reason string 'Fill price is invalid'`);
      }
    });

    it('cannot to trade with invalid fill price', async () => {
      const orderUtils = new Orders(1337, web3, await p1Orders.getAddress());
      const aliceOrder: Order = {
        limitPrice: limitPrice,
        isBuy: false,
        isDecreaseOnly: false,
        amount: orderAmount,
        triggerPrice: PRICES.NONE,
        limitFee: Fee.fromBips(0),
        maker: alice.address,
        taker: admin.address,
        expiration: INTEGERS.ONE_YEAR_IN_SECONDS.times(1000),
        salt: new BigNumber("2"),
      };
      const aliceSignedOrder = await orderUtils.signOrderEthers(
        aliceOrder,
        alice as unknown as Wallet,
        SigningMethod.TypedData,
      );

      const aliceTradeData = orderUtils.fillToTradeData(
        {
          ...aliceOrder,
          typedSignature: aliceSignedOrder,
        },
        orderAmount,
        new Price("0.2"),
        aliceOrder.limitFee,
      );

      const accounts: string[] = [bob.address, alice.address, admin.address]
        .map((e) => e.toLowerCase())
        .sort();
      
      const indexs = {};

      for (let i = 0; i < accounts.length; i++) {
        indexs[accounts[i]] = i;
      }
      const tradeArgs: TradeArg[] = [
        {
          makerIndex: indexs[alice.address.toLowerCase()],
          takerIndex: indexs[admin.address.toLowerCase()],
          trader: await p1Orders.getAddress(),
          data: aliceTradeData,
        },
      ];
      try {
        await perpetualV1.trade(accounts, tradeArgs, ["0", "0", "0"], [true, true, true], "2000000000000000000");

      } catch (error) {
        expect(error.message).to.be.equal(`VM Exception while processing transaction: reverted with reason string 'Fill price is invalid'`);
      }
    });
  });

});
