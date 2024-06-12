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

describe("P1Getter", function () {
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

  const BASE = parseEther("1");

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

  it('getGlobalOperator() success bob', async () => {
    await perpetualV1.setGlobalOperator(bob.address, true);
    expect(await perpetualV1.getIsGlobalOperator(bob.address)).to.be.equal(true);
    expect(await perpetualV1.getIsGlobalOperator(alice.address)).to.be.equal(false);
  });

  it('getGlobalOperator() success alice', async () => {
    await perpetualV1.setGlobalOperator(alice.address, true);
    expect(await perpetualV1.getIsGlobalOperator(alice.address)).to.be.equal(true);
    expect(await perpetualV1.getIsGlobalOperator(bob.address)).to.be.equal(true);
  });


  it('get when remove all setGlobalOperator()', async () => {
    await perpetualV1.setGlobalOperator(bob.address, false);
    await perpetualV1.setGlobalOperator(alice.address, false);
    expect(await perpetualV1.getIsGlobalOperator(alice.address)).to.be.equal(false);
    expect(await perpetualV1.getIsGlobalOperator(bob.address)).to.be.equal(false);
  });

  it('get and check the Oracle', async () => {
    const currentOracle = await perpetualV1.getOracleContract();
    expect(currentOracle).to.be.equal(p1MakerOracle.target);
    const newPrice = parseEther("28000");
    await test_MakerOracle.setPrice(newPrice);
    const price = await perpetualV1.getOraclePrice();
    console.log("🚀 ~ it ~ price:", price)
    expect(price).to.be.equal(newPrice);
  });

  it('get and sets the Oracle check', async () => {
    const currentOracle = await perpetualV1.getOracleContract();
    expect(currentOracle).to.be.equal(p1MakerOracle.target);
    const newPrice = parseEther("38000");
    await test_MakerOracle.setPrice(newPrice);
    const price = await perpetualV1.getOraclePrice();
    console.log("🚀 ~ it ~ price:", price)
    expect(price).to.be.equal(newPrice);
  });

  describe('getFunder()', () => {
    it('gets the Funder', async () => {
      await perpetualV1.setFunder(test_P1Funder.target);
      const currentFunder = await perpetualV1.getFunderContract();
      expect(currentFunder).to.be.equal(test_P1Funder.target);
    });

    it('gets the Funder value', async () => {
      await perpetualV1.setFunder(test_P1Funder.target);
      const currentFunder = await perpetualV1.getFunderContract();
      expect(currentFunder).to.be.equal(test_P1Funder.target);
      const newFunderValue = '200';
      await test_P1Funder.setFunding(true, newFunderValue);
      const [isPositive, fundingValue] = await test_P1Funder.getFunding('0');
      expect(fundingValue).to.be.equal(newFunderValue);
      expect(isPositive).to.be.equal(true);
    });

    it('gets the Funder value with zero', async () => {
      await perpetualV1.setFunder(test_P1Funder.target);
      const currentFunder = await perpetualV1.getFunderContract();
      expect(currentFunder).to.be.equal(test_P1Funder.target);
      const newFunderValue = '0';
      await test_P1Funder.setFunding(true, newFunderValue);
      const [isPositive, fundingValue] = await test_P1Funder.getFunding('0');
      expect(fundingValue).to.be.equal(newFunderValue);
      expect(isPositive).to.be.equal(true);
    });

  });

  describe('getMinCollateral()', () => {
    it('gets the collateral requirement', async () => {
      const minCollateral = parseEther('1.2');
      await perpetualV1.setMinCollateral(minCollateral);
      expect(await perpetualV1.getMinCollateral()).to.be.equal(minCollateral);
    });

  });

  describe('getWithdrawDelayBlock()', () => {
    it('sets the delay block', async () => {
      const delay = 10;
      await perpetualV1.setWithdrawDelayBlock(delay);
      expect(await perpetualV1.getDelayBlock()).to.be.equal(delay);
    });

    it('gets the delay block 2', async () => {
      const delay = 10000;
      await perpetualV1.setWithdrawDelayBlock(delay);
      expect(await perpetualV1.getDelayBlock()).to.be.equal(delay);
    });
  });

  describe('get account balance', () => {
    it('get account balance', async () => {
      const adminBalanceTest = parseEther("100000");
      await test_Token.connect(admin).mint(admin.address, adminBalanceTest);
      await test_Token.connect(admin).approve(perpetualV1.target, adminBalanceTest);
      const amount = parseEther("1000");
      const price = parseEther("20000");

      await perpetualV1.connect(admin).deposit(
        admin.address,
        admin.address,
        amount,
        price,
        parseEther("0.1"),
        true
      );
      let balance = await perpetualV1.getAccountBalance(admin.address);
      expect(balance[0]).to.equal(true);
      expect(balance[1]).to.equal(false);
      // because postion balance is 0 => can add funding fee
      expect(balance[2]).to.equal(amount);
      expect(balance[3]).to.equal(0);
    });

    it('get account balance', async () => {
      const adminBalanceTest = parseEther("100000");
      await test_Token.connect(admin).mint(admin.address, adminBalanceTest);
      await test_Token.connect(admin).approve(perpetualV1.target, adminBalanceTest);
      const oldAmount = parseEther("1000");
      const amount = parseEther("1000");
      const price = parseEther("20000");

      await perpetualV1.connect(admin).deposit(
        admin.address,
        admin.address,
        amount,
        price,
        parseEther("0.1"),
        true
      );
      let balance = await perpetualV1.getAccountBalance(admin.address);
      expect(balance[0]).to.equal(true);
      expect(balance[1]).to.equal(false);
      // because postion balance is 0 => can add funding fee
      expect(balance[2]).to.equal(amount + oldAmount);
      expect(balance[3]).to.equal(0);
    });

    it('get account balance', async () => {
      const adminBalanceTest = parseEther("100000");
      await test_Token.connect(bob).mint(bob.address, adminBalanceTest);
      await test_Token.connect(bob).approve(perpetualV1.target, adminBalanceTest);
      const amount = parseEther("1000");
      const price = parseEther("20000");
      await perpetualV1.connect(admin).deposit(
        bob.address,
        bob.address,
        amount,
        price,
        parseEther("0.1"),
        true
      );
      let balance = await perpetualV1.getAccountBalance(bob.address);
      expect(balance[0]).to.equal(true);
      expect(balance[1]).to.equal(false);
      // because postion balance is 0 => can add funding fee
      expect(balance[2]).to.equal(amount);
      expect(balance[3]).to.equal(0);
    });

    it('getOracleContract', async () => {
      const oracle = await perpetualV1.getOracleContract();
      expect(oracle).to.be.equal(p1MakerOracle.target);
    });

    it('get getUserFlag', async () => {
       const userFlag = await perpetualV1.getUserFlag(bob.address);
       expect(userFlag).to.be.equal(0);
    });
  });
});
