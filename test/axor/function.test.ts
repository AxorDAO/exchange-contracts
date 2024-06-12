import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { HardhatEthersProvider } from "@nomicfoundation/hardhat-ethers/internal/hardhat-ethers-provider";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import assert from "assert";
import BigNumber from "bignumber.js";
import { expect } from "chai";
import { Signature, Wallet, parseEther, AbiCoder } from "ethers";
import { ethers } from "hardhat";
import Web3 from "web3";

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

describe("Function", function () {
  before(async function () {
    this.signers = {} as Signers;

    const signers = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.admin1 = signers[1];
    this.signers.admin2 = signers[2];

    this.loadFixture = loadFixture;
  });

  describe("Deployment", function () {
    async function mintAndDeposit(self: any, wallet: any) {
      await self.test_Token.connect(wallet).mint(wallet.address, "100000e6");
      await self.test_Token.connect(wallet).approve(await self.perpetualV1.getAddress(), "100000e6");
      await self.perpetualV1.connect(wallet).deposit(wallet.address, wallet.address, "10e6", "30e6", 0, true);

      const balance = await self.perpetualV1.getAccountBalance(wallet.address);
      console.log("🚀 ~ file: perpetual.spec.ts:39 ~ mintAndDeposit ~ balance:", wallet.address, balance);
    }

    async function mintAndDepositWithAmount(self: any, wallet: any, amount: BigNumber) {
      await self.test_Token.connect(wallet).mint(wallet.address, parseEther(amount.toString()));
      await self.test_Token.connect(wallet).approve(await self.perpetualV1.getAddress(), parseEther(amount.toString()));
      await self.perpetualV1.connect(wallet).deposit(wallet.address, parseEther(amount.toString()), "30e6", 0, true);

      const balance = await self.perpetualV1.getAccountBalance(wallet.address);
      console.log("🚀 ~ file: perpetual.spec.ts:39 ~ mintAndDeposit ~ balance:", wallet.address, balance);
    }

    beforeEach(async function () {
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
    });

    it("Function test", async function () {
      const signatures = {};
      let listContracts: any[] = [];
      listContracts.push(this.test_Lib);
      listContracts.push(this.test_P1Funder);
      listContracts.push(this.test_P1Oracle);
      listContracts.push(this.test_P1Trader);
      listContracts.push(this.test_Token);
      listContracts.push(this.test_Token2);
      listContracts.push(this.test_MakerOracle);
      listContracts.push(this.test_ChainlinkAggregator);
      listContracts.push(this.perpetualV1Impl);
      listContracts.push(this.perpetualV1);
      listContracts.push(this.p1FundingOracle);
      listContracts.push(this.p1ChainlinkOracle);
      listContracts.push(this.p1MakerOracle);
      listContracts.push(this.p1Orders);
      listContracts.push(this.p1Liquidation);
      listContracts.push(this.p1LiquidatorProxy);


      listContracts.forEach((contractInfo) => {
        contractInfo.interface.fragments.forEach((item) => {
          if (item.type === "function") {
            const fourByte = toFourByte(item.name);

            // Expect no collision.
            if (signatures[fourByte]) {
              expect(signatures[fourByte]).equals(
                item.name,
                `colliding four-byte signatures for ${signatures[fourByte]} and ${item.name}`,
              );
            }
            signatures[fourByte] = item.name;
          }
        })
      });
    });

    function toFourByte(method: string): string {
      return Web3.utils.keccak256(method).substr(0, 10).toLowerCase();
    }

    function isFunctionSignature(method: string): boolean {
      return method.includes('(') && method.includes(')');
    }
  });

});
