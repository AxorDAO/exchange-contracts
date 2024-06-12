import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { HardhatEthersProvider } from "@nomicfoundation/hardhat-ethers/internal/hardhat-ethers-provider";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import assert from "assert";
import BigNumber from "bignumber.js";
import { expect } from "chai";
import { Signature, Wallet, parseEther, AbiCoder } from "ethers";
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

describe("Libraries", function () {
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

  const BASE = parseEther("1");

  before(async function () {
    this.signers = {} as Signers;

    const signers = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.admin1 = signers[1];
    this.signers.admin2 = signers[2];
    admin = signers[0];

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

  it('getAdmin()', async () => {
    expect(await perpetualV1.getAdmin()).to.be.equal(admin.address);
  });
  it('base()', async () => {
    const base = await test_Lib.base();
    expect(base).to.be.equal(BASE);
  });
 

  it('baseMul()', async () => {
    expect(await test_Lib.baseMul(
      23456,
      new BaseValue('123.456').toSolidity(),
    )).to.equal(2895783);
  });

  it('baseMul()', async () => {
    expect(await test_Lib.baseMul(
      234560,
      new BaseValue('123.456').toSolidity(),
    )).to.equal(28957839);
  });

  it('baseDivMul()', async () => {
    expect(await test_Lib.baseDivMul(
      new BaseValue(23456).toSolidity(),
      new BaseValue('123.456').toSolidity(),
    )).to.equal(new BaseValue('2895783.936').toSolidity());
  });

  it('baseDivMul()', async () => {
    expect(await test_Lib.baseDivMul(
      new BaseValue(234560).toSolidity(),
      new BaseValue('123.456').toSolidity(),
    )).to.equal(new BaseValue('28957839.36').toSolidity());
  });

  it('baseDivMul()', async () => {
    expect(await test_Lib.baseDivMul(
      new BaseValue(2345600).toSolidity(),
      new BaseValue('123.456').toSolidity(),
    )).to.equal(new BaseValue('289578393.6').toSolidity());
  });

  it('baseMulRoundUp()', async () => {
    expect(await test_Lib.baseMulRoundUp(
      23456,
      new BaseValue('123.456').toSolidity(),
    )).to.equal(2895784);
    expect(await test_Lib.baseMulRoundUp(
      5,
      new BaseValue('5').toSolidity(),
    )).to.equal(25);

    // If value is zero.
    expect(await test_Lib.baseMulRoundUp(
      0,
      new BaseValue('5').toSolidity(),
    )).to.equal(0);

    // If baseValue is zero.
    expect(await test_Lib.baseMulRoundUp(
      5,
      new BaseValue('0').toSolidity(),
    )).to.equal(0);
  });

  it('baseDiv()', async () => {
    expect(await test_Lib.baseDiv(
      2895783,
      new BaseValue('123.456').toSolidity(),
    )).to.equal(23455);
  });

  it('baseDiv()', async () => {
    expect(await test_Lib.baseDiv(
      0,
      new BaseValue('123.456').toSolidity(),
    )).to.equal(0);
  });

  it('baseDiv() reverts if denominator is zero', async () => {
    try {
      await test_Lib.baseDiv(2895783, 0);
    } catch (error) {
      expect(error.message).to.be.equal('VM Exception while processing transaction: reverted with reason string \'SafeMath: division by zero\'');
    }

  });

  it('baseDiv() reverts if denominator is zero', async () => {
    try {
      await test_Lib.baseDiv(0, 0);
    } catch (error) {
      expect(error.message).to.be.equal('VM Exception while processing transaction: reverted with reason string \'SafeMath: division by zero\'');
    }

  });

  it('baseReciprocal()', async () => {
    expect(await test_Lib.baseReciprocal(
      new BaseValue('123.456').toSolidity(),
    )).to.equal(new BaseValue('0.008100051840331778').toSolidity());
    expect(await test_Lib.baseReciprocal(
      new BaseValue('0.00810005184').toSolidity(),
    )).to.equal(new BaseValue('123.456000005056757760').toSolidity());
  });

  it('baseReciprocal() reverts if denominator is zero', async () => {
    try {
      await test_Lib.baseReciprocal(0);
    } catch (error) {
      expect(error.message).to.be.equal('VM Exception while processing transaction: reverted with reason string \'SafeMath: division by zero\'');
    }
  });

});
