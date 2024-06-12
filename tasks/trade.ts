import assert from "assert";
import BigNumber from "bignumber.js";
import { parseEther } from "ethers";
import { task } from "hardhat/config";
import Web3 from "web3";

import { getSignedOrder } from "../test/utils/order";
import { INTEGERS, PRICES } from "./lib/Constants";
import { Fee, Order, Price, SignedOrder, SigningMethod, TradeArg } from "./lib/types";
import { Orders } from "./utils/Orders";
import { signatureToSolidityStruct } from "./lib/SignatureHelper";

task("trade", "open order and trade").setAction(async function (_, hre) {
  const { ethers, deployments } = hre;

  const PerpetualProxy = await deployments.get("PerpetualProxy");
  const P1Orders = await deployments.get("P1Orders");
  const Test_Token = await deployments.get("Test_Token");
  const Test_MakerOracle = await deployments.get("Test_MakerOracle");
  const testToken = await ethers.getContractAt("Test_Token", Test_Token.address);
  const testMakerOracle = await ethers.getContractAt("Test_MakerOracle", Test_MakerOracle.address);
  const perpetualProxy = await ethers.getContractAt("PerpetualV1", PerpetualProxy.address);
  const signers = await ethers.getSigners();
  const maker = signers[0];
  const taker = signers[1];
  const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
  const privateKey = "91c8c12dbf075f1141665dbeea2df91c62ae0296d785552872e4337a2ffd2a81";
  const privateKey1 = "992725e69bddc1e68d1cd16ac9859c5af32c74c94eb29b6074833fe74f982fb2";
  web3.eth.accounts.privateKeyToAccount("0x" + privateKey);
  await perpetualProxy.setGlobalOperator(maker.address, true);

  const orderUtils = new Orders(1337, web3, P1Orders.address);

  // mint and approve
  // await testToken.mint(maker, parseEther("1000"));
  // await testToken.mint(taker, parseEther("1000"));
  // await testToken.approve(PerpetualProxy.address, parseEther("1000"));
  // await testToken.connect(taker).approve(PerpetualProxy.address, parseEther("1000"));
  // await perpetualProxy.deposit(maker, parseEther("1000"));
  // await perpetualProxy.connect(taker).deposit(taker, parseEther("1000"));

  const orderAmount = new BigNumber("1e18");
  const limitPrice = new Price("987.65432");
  await testMakerOracle.setPrice(limitPrice.toSolidity());

  // create order
  const defaultOrder: Order = {
    limitPrice,
    isBuy: true,
    isDecreaseOnly: false,
    amount: orderAmount,
    triggerPrice: PRICES.NONE,
    limitFee: Fee.fromBips(20),
    maker: maker.address,
    taker: taker.address,
    expiration: INTEGERS.ONE_YEAR_IN_SECONDS.times(100),
    salt: new BigNumber("425"),
  };

  const initialMargin = orderAmount.times(limitPrice.value).times(2);
  const fullFlagOrder: Order = {
    ...defaultOrder,
    isDecreaseOnly: true,
    limitFee: new Fee(defaultOrder.limitFee.value.abs().negated()),
  };
  let defaultSignedOrder: SignedOrder;
  let fullFlagSignedOrder: SignedOrder;
  let admin: address;
  let otherUser: address;

  const signedOrder = await getSignedOrder(orderUtils, defaultOrder, SigningMethod.Hash);
  defaultSignedOrder = signedOrder;
  const sig = signatureToSolidityStruct(defaultSignedOrder.typedSignature);
  console.log("🚀 ~ file: trade.ts:74 ~ sig:", sig)
  console.log("\x1b[36m%s\x1b[0m", "defaultOrder", defaultOrder);
  console.log("🚀 ~ file: trade.ts:60 ~ signedOrder:", signedOrder);

  const validSig = orderUtils.orderHasValidSignature({
    ...defaultOrder,
    typedSignature: signedOrder.typedSignature,
  });
  assert(validSig, "invalid signature");

  const tradeData = orderUtils.fillToTradeData(defaultSignedOrder, orderAmount, limitPrice, defaultOrder.limitFee);
  const tradeArgs: TradeArg[] = [
    {
      makerIndex: 0,
      takerIndex: 1,
      trader: maker.address,
      data: tradeData,
    },
  ];
  const accounts: string[] = [maker.address, taker.address];

  // await perpetualProxy.connect(maker).trade(accounts, tradeArgs);
});
