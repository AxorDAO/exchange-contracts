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

describe("P1Margin", function () {
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

  describe('deposit()', () => {

    it('Account owner can deposit', async () => {
      const amount = parseEther("1000");
      const mintAmount = parseEther("1000000000000000000")
      const price = parseEther("20000");
      await test_Token.mint(admin.address, mintAmount);
      await test_Token.connect(admin).approve(perpetualV1.target, mintAmount);
      await perpetualV1.connect(admin).deposit(
        admin.address,
        admin.address,
        amount,
        price,
        0,
        true
      );
      let balance = await perpetualV1.getAccountBalance(admin.address);
      expect(balance[0]).to.equal(true);
      expect(balance[1]).to.equal(false);
      expect(balance[2]).to.equal(amount);
      expect(balance[3]).to.equal(0);

      await perpetualV1.connect(admin).deposit(
        admin.address,
        admin.address,
        amount,
        price,
        0,
        true
      );

      balance = await perpetualV1.getAccountBalance(admin.address);
      expect(balance[0]).to.equal(true);
      expect(balance[1]).to.equal(false);
      expect(balance[2]).to.equal(parseEther("2000"));
      expect(balance[3]).to.equal(0);


      await perpetualV1.connect(admin).deposit(
        admin.address,
        admin.address,
        parseEther("599"),
        price,
        0,
        true
      );

      balance = await perpetualV1.getAccountBalance(admin.address);
      expect(balance[0]).to.equal(true);
      expect(balance[1]).to.equal(false);
      expect(balance[2]).to.equal(parseEther("2599"));
      expect(balance[3]).to.equal(0);
    });

    it('check funding fee', async () => {
      const oldAmount = parseEther("2599");
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

    it('Account owner can deposit for bob', async () => {
      const amount = parseEther("1000");
      const mintAmount = parseEther("1000000000000000000")
      const price = parseEther("20000");
      await test_Token.mint(admin.address, mintAmount);
      await test_Token.connect(admin).approve(perpetualV1.target, mintAmount);
      await perpetualV1.connect(admin).deposit(
        admin.address,
        bob.address,
        amount,
        price,
        0,
        true
      );
      let balance = await perpetualV1.getAccountBalance(bob.address);
      expect(balance[0]).to.equal(true);
      expect(balance[1]).to.equal(false);
      expect(balance[2]).to.equal(amount);
      expect(balance[3]).to.equal(0);

      await perpetualV1.connect(admin).deposit(
        admin.address,
        bob.address,
        amount,
        price,
        0,
        true
      );

      balance = await perpetualV1.getAccountBalance(bob.address);
      expect(balance[0]).to.equal(true);
      expect(balance[1]).to.equal(false);
      expect(balance[2]).to.equal(parseEther("2000"));
      expect(balance[3]).to.equal(0);


      await perpetualV1.connect(admin).deposit(
        admin.address,
        bob.address,
        parseEther("599"),
        price,
        0,
        true
      );

      balance = await perpetualV1.getAccountBalance(bob.address);
      expect(balance[0]).to.equal(true);
      expect(balance[1]).to.equal(false);
      expect(balance[2]).to.equal(parseEther("2599"));
      expect(balance[3]).to.equal(0);

    });


    it('bob can deposit for himself', async () => {
      const oldAmount = parseEther("2599");
      const amount = parseEther("1000");
      const mintAmount = parseEther("1000000000000000000")
      const price = parseEther("20000");
      await test_Token.mint(bob.address, mintAmount);
      await test_Token.connect(bob).approve(perpetualV1.target, mintAmount);
      await perpetualV1.connect(admin).deposit(
        bob.address,
        bob.address,
        amount,
        price,
        0,
        true
      );
      let balance = await perpetualV1.getAccountBalance(bob.address);
      expect(balance[0]).to.equal(true);
      expect(balance[1]).to.equal(false);
      expect(balance[2]).to.equal(amount + oldAmount);
      expect(balance[3]).to.equal(0);

      await perpetualV1.connect(admin).deposit(
        bob.address,
        bob.address,
        amount,
        price,
        0,
        true
      );

      balance = await perpetualV1.getAccountBalance(bob.address);
      expect(balance[0]).to.equal(true);
      expect(balance[1]).to.equal(false);
      expect(balance[2]).to.equal(oldAmount + amount + amount);
      expect(balance[3]).to.equal(0);

    });

    it('bob can deposit for alice', async () => {
      const oldAmount = parseEther("0");
      const amount = parseEther("1000");
      const mintAmount = parseEther("1000000000000000000")
      const price = parseEther("20000");
      await test_Token.mint(bob.address, mintAmount);
      await test_Token.connect(bob).approve(perpetualV1.target, mintAmount);
      await perpetualV1.connect(admin).deposit(
        bob.address,
        alice.address,
        amount,
        price,
        0,
        true
      );
      let balance = await perpetualV1.getAccountBalance(alice.address);
      expect(balance[0]).to.equal(true);
      expect(balance[1]).to.equal(false);
      expect(balance[2]).to.equal(amount + oldAmount);
      expect(balance[3]).to.equal(0);

      await perpetualV1.connect(admin).deposit(
        bob.address,
        alice.address,
        amount,
        price,
        0,
        true
      );

      balance = await perpetualV1.getAccountBalance(alice.address);
      expect(balance[0]).to.equal(true);
      expect(balance[1]).to.equal(false);
      expect(balance[2]).to.equal(oldAmount + amount + amount);
      expect(balance[3]).to.equal(0);

    });

    it('bob cannot deposit for himself without admin', async () => {
      const oldAmount = parseEther("0");
      const amount = parseEther("1000");
      const mintAmount = parseEther("1000000000000000000")
      const price = parseEther("20000");
      await test_Token.mint(bob.address, mintAmount);
      await test_Token.connect(bob).approve(perpetualV1.target, mintAmount);

      try {
        await perpetualV1.connect(bob).deposit(
          bob.address,
          bob.address,
          amount,
          price,
          0,
          true
        );
      } catch (error) {
        expect(error.message).to.be.equal(`VM Exception while processing transaction: revert with reason "trader is not global operator"`);
      }
    });

    it('alice cannot deposit more than balance', async () => {
      const oldAmount = parseEther("0");
      const amount = parseEther("10000");
      const mintAmount = parseEther("2000")
      const price = parseEther("20000");
      await test_Token.mint(alice.address, mintAmount);
      await test_Token.connect(alice).approve(perpetualV1.target, mintAmount);

      try {
        await perpetualV1.connect(admin).deposit(
          alice.address,
          alice.address,
          amount,
          price,
          0,
          true
        );
      } catch (error) {
        expect(error.message).to.be.equal(`VM Exception while processing transaction: revert with reason "SafeERC20: low-level call failed"`);
      }
    });

    it('alice cannot deposit for bob more than balance', async () => {
      const oldAmount = parseEther("0");
      const amount = parseEther("10000");
      const mintAmount = parseEther("2000")
      const price = parseEther("20000");
      await test_Token.mint(alice.address, mintAmount);
      await test_Token.connect(alice).approve(perpetualV1.target, mintAmount);

      try {
        await perpetualV1.connect(admin).deposit(
          alice.address,
          bob.address,
          amount,
          price,
          0,
          true
        );
      } catch (error) {
        expect(error.message).to.be.equal(`VM Exception while processing transaction: revert with reason "SafeERC20: low-level call failed"`);
      }
    });

    it('admin cannot deposit more than balance', async () => {
      const oldAmount = parseEther("0");
      const amount = parseEther("100000000000000000000000000");
      const mintAmount = parseEther("2000")
      const price = parseEther("20000");
      await test_Token.connect(alice).approve(perpetualV1.target, mintAmount);

      try {
        await perpetualV1.connect(admin).deposit(
          admin.address,
          admin.address,
          amount,
          price,
          0,
          true
        );
      } catch (error) {
        expect(error.message).to.be.equal(`VM Exception while processing transaction: revert with reason "SafeERC20: low-level call failed"`);
      }
    });
  });

  describe('withdraw()', () => {

    it('Account owner can withdraw partial amount', async () => {
      const adminBalanceTest = parseEther("1000");
      let adminBalance = await perpetualV1.getAccountBalance(admin.address);
      await perpetualV1.connect(admin).withdraw(
        admin.address,
        admin.address,
        adminBalance.margin,
        0,
        0,
        true
      );
      await perpetualV1.deposit(
        admin.address,
        admin.address,
        adminBalanceTest,
        0,
        0,
        true
      )
      adminBalance = await perpetualV1.getAccountBalance(admin.address);
      const withdrawAmount = parseEther("10");
      const expectAmount = adminBalance.margin - withdrawAmount;
      await perpetualV1.connect(admin).withdraw(
        admin.address,
        admin.address,
        withdrawAmount,
        0,
        0,
        true
      );

      const adminBalanceAfter = await perpetualV1.getAccountBalance(admin.address);
      expect(adminBalanceAfter.margin).to.equal(expectAmount);
      expect(adminBalanceAfter.margin).to.equal(adminBalanceTest - withdrawAmount);
    });
    it('Account owner can withdraw total amount', async () => {
      const adminBalanceTest = parseEther("1000");
      let adminBalance = await perpetualV1.getAccountBalance(admin.address);
      await test_Token.connect(admin).mint(admin.address, adminBalanceTest);
      await test_Token.connect(admin).approve(perpetualV1.target, adminBalanceTest);
      await perpetualV1.connect(admin).withdraw(
        admin.address,
        admin.address,
        adminBalance.margin,
        0,
        0,
        true
      );
      await perpetualV1.deposit(
        admin.address,
        admin.address,
        adminBalanceTest,
        0,
        0,
        true
      )
      adminBalance = await perpetualV1.getAccountBalance(admin.address);
      const testBalanceBefore = await test_Token.balanceOf(admin.address);

      await perpetualV1.connect(admin).withdraw(
        admin.address,
        admin.address,
        adminBalanceTest,
        0,
        0,
        true
      );
      const adminBalanceAfter = await perpetualV1.getAccountBalance(admin.address);
      expect(adminBalanceAfter.margin).to.equal(0);
      const testBalanceAfter = await test_Token.balanceOf(admin.address);
      expect(testBalanceBefore + adminBalanceTest).to.equal(testBalanceAfter);


    });
  
    it('Account owner cannot withdraw excess total amount', async () => {
      const adminBalanceTest = parseEther("1000");
      let adminBalance = await perpetualV1.getAccountBalance(admin.address);
      await test_Token.connect(admin).mint(admin.address, adminBalanceTest);
      await test_Token.connect(admin).approve(perpetualV1.target, adminBalanceTest);
      await perpetualV1.connect(admin).withdraw(
        admin.address,
        admin.address,
        adminBalance.margin,
        0,
        0,
        true
      );
      await perpetualV1.deposit(
        admin.address,
        admin.address,
        adminBalanceTest,
        0,
        0,
        true
      )
      adminBalance = await perpetualV1.getAccountBalance(admin.address);

      try {
        await perpetualV1.connect(admin).withdraw(
          admin.address,
          admin.address,
          adminBalanceTest * parseUnits('2', 'wei'),
          0,
          0,
          true
        );
      } catch (error) {
        expect(error.message).to.be.equal(`VM Exception while processing transaction: revert with reason "account not collateralized"`);
      }
    });
  
    it('Account bob can withdraw partial amount', async () => {
      const bobBalanceTest = parseEther("1000");
      let bobBalance = await perpetualV1.getAccountBalance(bob.address);
      await test_Token.connect(bob).mint(bob.address, bobBalanceTest);
      await test_Token.connect(bob).approve(perpetualV1.target, bobBalanceTest);
      await perpetualV1.connect(admin).withdraw(
        bob.address,
        bob.address,
        bobBalance.margin,
        0,
        0,
        true
      );
      await perpetualV1.deposit(
        bob.address,
        bob.address,
        bobBalanceTest,
        0,
        0,
        true
      )
      bobBalance = await perpetualV1.getAccountBalance(bob.address);
      const withdrawAmount = parseEther("10");
      const expectAmount = bobBalance.margin - withdrawAmount;
      await perpetualV1.connect(admin).withdraw(
        bob.address,
        bob.address,
        withdrawAmount,
        0,
        0,
        true
      );
  
      const adminBalanceAfter = await perpetualV1.getAccountBalance(bob.address);
      expect(adminBalanceAfter.margin).to.equal(expectAmount);
      expect(adminBalanceAfter.margin).to.equal(bobBalance.margin - withdrawAmount);
    });
    it('Account bob can withdraw total amount', async () => {
      const bobBalanceTest = parseEther("1000");
      let bobBalance = await perpetualV1.getAccountBalance(bob.address);
      await test_Token.connect(bob).mint(bob.address, bobBalanceTest);
      await test_Token.connect(bob).approve(perpetualV1.target, bobBalanceTest);
      await perpetualV1.connect(admin).withdraw(
        bob.address,
        bob.address,
        bobBalance.margin,
        0,
        0,
        true
      );
      await perpetualV1.deposit(
        bob.address,
        bob.address,
        bobBalanceTest,
        0,
        0,
        true
      )
      bobBalance = await perpetualV1.getAccountBalance(admin.address);
      await perpetualV1.connect(admin).withdraw(
        bob.address,
        bob.address,
        bobBalanceTest,
        0,
        0,
        true
      );
      const adminBalanceAfter = await perpetualV1.getAccountBalance(bob.address);
      expect(adminBalanceAfter.margin).to.equal(0);
    });

    it('Account bob cannot withdraw excess total amount', async () => {
      const bobBalanceTest = parseEther("1000");
      let bobBalance = await perpetualV1.getAccountBalance(bob.address);
      await test_Token.connect(bob).mint(bob.address, bobBalanceTest);
      await test_Token.connect(bob).approve(perpetualV1.target, bobBalanceTest);
      await perpetualV1.connect(admin).withdraw(
        bob.address,
        bob.address,
        bobBalance.margin,
        0,
        0,
        true
      );
      await perpetualV1.deposit(
        bob.address,
        bob.address,
        bobBalanceTest,
        0,
        0,
        true
      )
      bobBalance = await perpetualV1.getAccountBalance(bob.address);

      try {
        await perpetualV1.connect(admin).withdraw(
          bob.address,
          bob.address,
          bobBalanceTest * parseUnits('2', 'wei'),
          0,
          0,
          true
        );
      } catch (error) {
        expect(error.message).to.be.equal(`VM Exception while processing transaction: revert with reason "account not collateralized"`);
      }
    });

    it('Account bob cannot withdraw without admin', async () => {
      const bobBalanceTest = parseEther("1000");
      let bobBalance = await perpetualV1.getAccountBalance(bob.address);
      await test_Token.connect(bob).mint(bob.address, bobBalanceTest);
      await test_Token.connect(bob).approve(perpetualV1.target, bobBalanceTest);
      await perpetualV1.connect(admin).withdraw(
        bob.address,
        bob.address,
        bobBalance.margin,
        0,
        0,
        true
      );
      await perpetualV1.deposit(
        bob.address,
        bob.address,
        bobBalanceTest,
        0,
        0,
        true
      )
      bobBalance = await perpetualV1.getAccountBalance(bob.address);

      try {
        await perpetualV1.connect(bob).withdraw(
          bob.address,
          bob.address,
          bobBalanceTest,
          0,
          0,
          true
        );
      } catch (error) {
        expect(error.message).to.be.equal(`VM Exception while processing transaction: revert with reason "only global operator can withdraw"`);
      }
    });

    it('Account bob check withdraw directly', async () => {
      const bobBalanceTest = parseEther("1000");
      let bobBalance = await perpetualV1.getAccountBalance(bob.address);
      await test_Token.connect(bob).mint(bob.address, bobBalanceTest);
      await test_Token.connect(bob).approve(perpetualV1.target, bobBalanceTest);
      await perpetualV1.connect(admin).withdraw(
        bob.address,
        bob.address,
        bobBalance.margin,
        0,
        0,
        true
      );
      await perpetualV1.deposit(
        bob.address,
        bob.address,
        bobBalanceTest,
        0,
        0,
        true
      )
      bobBalance = await perpetualV1.getAccountBalance(bob.address);
      await perpetualV1.setWithdrawDelayBlock(10);
      let bobBlock = await perpetualV1.getUserFlag(bob.address);
      expect(bobBlock).to.equal(0);
      await perpetualV1.setWithdrawDelayBlock(10);
      const blockNumber = (await ethers.provider.getBlock('latest')).number;
      await perpetualV1.connect(bob).requestWithdraw(
        bob.address,
        bob.address
      )
      bobBlock = await perpetualV1.getUserFlag(bob.address);
      expect(blockNumber + 1).to.equal(bobBlock);
      await mineNBlocks(10);
      const newBlockNumber = (await ethers.provider.getBlock('latest')).number;
      console.log("🚀 ~ it ~ newBlockNumber:", newBlockNumber)
      expect(newBlockNumber).to.equal(bobBlock + parseUnits("10", 'wei'));
    });

    it('Account bob can withdraw directly', async () => {
      const bobBalanceTest = parseEther("1000");
      let bobBalance = await perpetualV1.getAccountBalance(bob.address);
      await test_Token.connect(bob).mint(bob.address, bobBalanceTest);
      await test_Token.connect(bob).approve(perpetualV1.target, bobBalanceTest);
      await perpetualV1.connect(admin).withdraw(
        bob.address,
        bob.address,
        bobBalance.margin,
        0,
        0,
        true
      );
      await perpetualV1.deposit(
        bob.address,
        bob.address,
        bobBalanceTest,
        0,
        0,
        true
      )
      bobBalance = await perpetualV1.getAccountBalance(bob.address);
      await perpetualV1.setWithdrawDelayBlock(10);
      let bobBlock = await perpetualV1.getUserFlag(bob.address);
      expect(bobBlock).to.equal(0);
      await perpetualV1.setWithdrawDelayBlock(10);
      const blockNumber = (await ethers.provider.getBlock('latest')).number;
      await perpetualV1.connect(bob).requestWithdraw(
        bob.address,
        bob.address
      )
      bobBlock = await perpetualV1.getUserFlag(bob.address);
      await test_MakerOracle.setPrice("100000000");
      
      await mineNBlocks(10);

      await perpetualV1.connect(bob).userWithdraw(
        bob.address,
        bob.address,
        bobBalanceTest
      );

    });


    it('Account bob cannot withdraw directly with the invalid amount', async () => {
      const bobBalanceTest = parseEther("1000");
      let bobBalance = await perpetualV1.getAccountBalance(bob.address);
      await test_Token.connect(bob).mint(bob.address, bobBalanceTest);
      await test_Token.connect(bob).approve(perpetualV1.target, bobBalanceTest);
      await perpetualV1.connect(admin).withdraw(
        bob.address,
        bob.address,
        bobBalance.margin,
        0,
        0,
        true
      );
      await perpetualV1.deposit(
        bob.address,
        bob.address,
        bobBalanceTest,
        0,
        0,
        true
      )
      bobBalance = await perpetualV1.getAccountBalance(bob.address);
      await perpetualV1.setWithdrawDelayBlock(10);
      let bobBlock = await perpetualV1.getUserFlag(bob.address);
      expect(bobBlock).to.equal(0);
      await perpetualV1.setWithdrawDelayBlock(10);
      const blockNumber = (await ethers.provider.getBlock('latest')).number;
      await perpetualV1.connect(bob).requestWithdraw(
        bob.address,
        bob.address
      )
      bobBlock = await perpetualV1.getUserFlag(bob.address);
      await test_MakerOracle.setPrice("100000000");
      
      await mineNBlocks(10);

      try {
        await perpetualV1.connect(bob).userWithdraw(
          bob.address,
          bob.address,
          bobBalanceTest + parseUnits('100', 'wei')
        );
      } catch (error) {
        expect(error.message).to.be.equal(`VM Exception while processing transaction: revert with reason "account not collateralized"`);
      }

    });


    it('Account bob cannot withdraw directly when price is 0', async () => {
      const bobBalanceTest = parseEther("1000");
      let bobBalance = await perpetualV1.getAccountBalance(bob.address);
      await test_Token.connect(bob).mint(bob.address, bobBalanceTest);
      await test_Token.connect(bob).approve(perpetualV1.target, bobBalanceTest);
      await perpetualV1.connect(admin).withdraw(
        bob.address,
        bob.address,
        bobBalance.margin,
        0,
        0,
        true
      );
      await perpetualV1.deposit(
        bob.address,
        bob.address,
        bobBalanceTest,
        0,
        0,
        true
      )
      bobBalance = await perpetualV1.getAccountBalance(bob.address);
      await perpetualV1.setWithdrawDelayBlock(10);
      let bobBlock = await perpetualV1.getUserFlag(bob.address);
      expect(bobBlock).to.equal(0);
      await perpetualV1.setWithdrawDelayBlock(10);
      const blockNumber = (await ethers.provider.getBlock('latest')).number;
      await perpetualV1.connect(bob).requestWithdraw(
        bob.address,
        bob.address
      )
      bobBlock = await perpetualV1.getUserFlag(bob.address);
      
      await mineNBlocks(10);

      try {
        await perpetualV1.connect(bob).userWithdraw(
          bob.address,
          bob.address,
          bobBalanceTest
        );
      } catch (error) {
        expect(error.message).to.be.equal(`VM Exception while processing transaction: revert with reason "Oracle would return zero price"`);
      }

    });

    it('Account admin check withdraw directly', async () => {
      const adminBalanceTest = parseEther("1000");
      let adminBalance = await perpetualV1.getAccountBalance(bob.address);
      await test_Token.connect(admin).mint(admin.address, adminBalanceTest);
      await test_Token.connect(admin).approve(perpetualV1.target, adminBalanceTest);
      await perpetualV1.connect(admin).withdraw(
        admin.address,
        admin.address,
        adminBalance.margin,
        0,
        0,
        true
      );
      await perpetualV1.deposit(
        admin.address,
        admin.address,
        adminBalanceTest,
        0,
        0,
        true
      )
      adminBalance = await perpetualV1.getAccountBalance(admin.address);
      await perpetualV1.setWithdrawDelayBlock(10);
      let bobBlock = await perpetualV1.getUserFlag(admin.address);
      expect(bobBlock).to.equal(0);
      await perpetualV1.setWithdrawDelayBlock(10);
      const blockNumber = (await ethers.provider.getBlock('latest')).number;
      await perpetualV1.connect(admin).requestWithdraw(
        admin.address,
        admin.address
      )
      bobBlock = await perpetualV1.getUserFlag(admin.address);
      expect(blockNumber + 1).to.equal(bobBlock);
      await mineNBlocks(10);
      const newBlockNumber = (await ethers.provider.getBlock('latest')).number;
      console.log("🚀 ~ it ~ newBlockNumber:", newBlockNumber)
      expect(newBlockNumber).to.equal(bobBlock + parseUnits("10", 'wei'));
    });

    it('Account admin can withdraw directly', async () => {
      const adminBalanceTest = parseEther("1000");
      let adminBalance = await perpetualV1.getAccountBalance(admin.address);
      await test_Token.connect(admin).mint(admin.address, adminBalanceTest);
      await test_Token.connect(admin).approve(perpetualV1.target, adminBalanceTest);
      await perpetualV1.connect(admin).withdraw(
        admin.address,
        admin.address,
        adminBalance.margin,
        0,
        0,
        true
      );
      await perpetualV1.deposit(
        admin.address,
        admin.address,
        adminBalanceTest,
        0,
        0,
        true
      )
      adminBalance = await perpetualV1.getAccountBalance(admin.address);
      await perpetualV1.setWithdrawDelayBlock(10);
      let bobBlock = await perpetualV1.getUserFlag(admin.address);
      expect(bobBlock).to.equal(0);
      await perpetualV1.setWithdrawDelayBlock(10);
      const blockNumber = (await ethers.provider.getBlock('latest')).number;
      await perpetualV1.connect(admin).requestWithdraw(
        admin.address,
        admin.address
      )
      bobBlock = await perpetualV1.getUserFlag(admin.address);
      await test_MakerOracle.setPrice("100000000");
      
      await mineNBlocks(10);

      await perpetualV1.connect(admin).userWithdraw(
        admin.address,
        admin.address,
        adminBalanceTest
      );

    });


    it('Account admin cannot withdraw directly with the invalid amount', async () => {
      const adminBalanceTest = parseEther("1000");
      let adminBalance = await perpetualV1.getAccountBalance(admin.address);
      await test_Token.connect(admin).mint(admin.address, adminBalanceTest);
      await test_Token.connect(admin).approve(perpetualV1.target, adminBalanceTest);
      await perpetualV1.connect(admin).withdraw(
        admin.address,
        admin.address,
        adminBalance.margin,
        0,
        0,
        true
      );
      await perpetualV1.deposit(
        admin.address,
        admin.address,
        adminBalanceTest,
        0,
        0,
        true
      )
      adminBalance = await perpetualV1.getAccountBalance(admin.address);
      await perpetualV1.setWithdrawDelayBlock(10);
      let bobBlock = await perpetualV1.getUserFlag(admin.address);
      expect(bobBlock).to.equal(0);
      await perpetualV1.setWithdrawDelayBlock(10);
      const blockNumber = (await ethers.provider.getBlock('latest')).number;
      await perpetualV1.connect(admin).requestWithdraw(
        admin.address,
        admin.address
      )
      bobBlock = await perpetualV1.getUserFlag(admin.address);
      await test_MakerOracle.setPrice("100000000");
      
      await mineNBlocks(10);

      try {
        await perpetualV1.connect(admin).userWithdraw(
          admin.address,
          admin.address,
          adminBalanceTest + parseUnits('100', 'wei')
        );
      } catch (error) {
        expect(error.message).to.be.equal(`VM Exception while processing transaction: revert with reason "account not collateralized"`);
      }

    });


    it('Account admin cannot withdraw directly when price is 0', async () => {
      const adminBalanceTest = parseEther("1000");
      let adminBalance = await perpetualV1.getAccountBalance(admin.address);
      await test_Token.connect(admin).mint(admin.address, adminBalanceTest);
      await test_Token.connect(admin).approve(perpetualV1.target, adminBalanceTest);
      await perpetualV1.connect(admin).withdraw(
        admin.address,
        admin.address,
        adminBalance.margin,
        0,
        0,
        true
      );
      await perpetualV1.deposit(
        admin.address,
        admin.address,
        adminBalanceTest,
        0,
        0,
        true
      )
      adminBalance = await perpetualV1.getAccountBalance(admin.address);
      await perpetualV1.setWithdrawDelayBlock(10);
      let bobBlock = await perpetualV1.getUserFlag(admin.address);
      expect(bobBlock).to.equal(0);
      await perpetualV1.setWithdrawDelayBlock(10);
      const blockNumber = (await ethers.provider.getBlock('latest')).number;
      await perpetualV1.connect(admin).requestWithdraw(
        admin.address,
        admin.address
      )
      bobBlock = await perpetualV1.getUserFlag(admin.address);
      
      await mineNBlocks(10);

      try {
        await perpetualV1.connect(admin).userWithdraw(
          admin.address,
          admin.address,
          adminBalanceTest
        );
      } catch (error) {
        expect(error.message).to.be.equal(`VM Exception while processing transaction: revert with reason "Oracle would return zero price"`);
      }

    });

    it('Account bob cannot withdraw directly when price is 0', async () => {
      const adminBalanceTest = parseEther("1000");
      let adminBalance = await perpetualV1.getAccountBalance(admin.address);
      await test_Token.connect(bob).mint(bob.address, adminBalanceTest);
      await test_Token.connect(bob).approve(perpetualV1.target, adminBalanceTest);
      await perpetualV1.connect(admin).withdraw(
        bob.address,
        bob.address,
        adminBalance.margin,
        0,
        0,
        true
      );
      await perpetualV1.deposit(
        bob.address,
        bob.address,
        adminBalanceTest,
        0,
        0,
        true
      )
      adminBalance = await perpetualV1.getAccountBalance(bob.address);
      await perpetualV1.setWithdrawDelayBlock(10);
      let bobBlock = await perpetualV1.getUserFlag(bob.address);
      expect(bobBlock).to.equal(0);
      await perpetualV1.setWithdrawDelayBlock(10);
      const blockNumber = (await ethers.provider.getBlock('latest')).number;
      await perpetualV1.connect(bob).requestWithdraw(
        bob.address,
        bob.address
      )
      bobBlock = await perpetualV1.getUserFlag(bob.address);
      
      await mineNBlocks(10);

      try {
        await perpetualV1.connect(bob).userWithdraw(
          bob.address,
          bob.address,
          adminBalanceTest
        );
      } catch (error) {
        expect(error.message).to.be.equal(`VM Exception while processing transaction: revert with reason "Oracle would return zero price"`);
      }

    });

    it('Account alice cannot withdraw directly when price is 0', async () => {
      const adminBalanceTest = parseEther("1000");
      let adminBalance = await perpetualV1.getAccountBalance(alice.address);
      await test_Token.connect(alice).mint(alice.address, adminBalanceTest);
      await test_Token.connect(alice).approve(perpetualV1.target, adminBalanceTest);
      await perpetualV1.connect(admin).withdraw(
        alice.address,
        alice.address,
        adminBalance.margin,
        0,
        0,
        true
      );
      await perpetualV1.deposit(
        alice.address,
        alice.address,
        adminBalanceTest,
        0,
        0,
        true
      )
      adminBalance = await perpetualV1.getAccountBalance(alice.address);
      await perpetualV1.setWithdrawDelayBlock(10);
      let bobBlock = await perpetualV1.getUserFlag(alice.address);
      expect(bobBlock).to.equal(0);
      await perpetualV1.setWithdrawDelayBlock(10);
      const blockNumber = (await ethers.provider.getBlock('latest')).number;
      await perpetualV1.connect(alice).requestWithdraw(
        alice.address,
        alice.address
      )
      bobBlock = await perpetualV1.getUserFlag(alice.address);
      
      await mineNBlocks(10);

      try {
        await perpetualV1.connect(alice).userWithdraw(
          alice.address,
          alice.address,
          adminBalanceTest
        );
      } catch (error) {
        expect(error.message).to.be.equal(`VM Exception while processing transaction: revert with reason "Oracle would return zero price"`);
      }

    });

  });

  
});
