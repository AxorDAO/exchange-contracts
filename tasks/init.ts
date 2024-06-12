import { parseEther } from "ethers";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("init-op", "approve and init operator").setAction(async function (_, hre) {
  const { ethers, deployments } = hre;

  const PerpetualProxy = await deployments.get("PerpetualProxy");
  const Test_Token = await deployments.get("Test_Token");
  const P1Orders = await deployments.get("P1Orders");
  const P1Liquidation = await deployments.get("P1Liquidation");
  const P1CurrencyConverterProxy = await deployments.get("P1CurrencyConverterProxy");
  const P1LiquidatorProxy = await deployments.get("P1LiquidatorProxy");
  const P1WethProxy = await deployments.get("P1WethProxy");
  const Test_P1Trader = await deployments.get("Test_P1Trader");

  const currencyConverterProxy = await hre.ethers.getContractAt(
    "P1CurrencyConverterProxy",
    P1CurrencyConverterProxy.address,
  );
  const liquidatorProxy = await hre.ethers.getContractAt("P1LiquidatorProxy", P1LiquidatorProxy.address);
  const wethProxy = await hre.ethers.getContractAt("P1WethProxy", P1WethProxy.address);
  const perpetualProxy = await ethers.getContractAt("PerpetualV1", PerpetualProxy.address);
  const signers = await ethers.getSigners();
  await currencyConverterProxy.connect(signers[0]).approveMaximumOnPerpetual(PerpetualProxy.address);
  console.log("\x1b[36m%s\x1b[0m", "done tx");
  await liquidatorProxy.connect(signers[0]).approveMaximumOnPerpetual();
  console.log("\x1b[36m%s\x1b[0m", "done tx");
  await wethProxy.connect(signers[0]).approveMaximumOnPerpetual(PerpetualProxy.address);

  console.log("\x1b[36m%s\x1b[0m", "done tx");
  await perpetualProxy.connect(signers[0]).setGlobalOperator(P1Orders.address, true);
  console.log("\x1b[36m%s\x1b[0m", "done tx");
  await perpetualProxy.connect(signers[0]).setGlobalOperator(P1Liquidation.address, true);
  console.log("\x1b[36m%s\x1b[0m", "done tx");
  await perpetualProxy.connect(signers[0]).setGlobalOperator(P1CurrencyConverterProxy.address, true);
  console.log("\x1b[36m%s\x1b[0m", "done tx");
  await perpetualProxy.connect(signers[0]).setGlobalOperator(P1LiquidatorProxy.address, true);
  console.log("\x1b[36m%s\x1b[0m", "done tx");
  await perpetualProxy.connect(signers[0]).setGlobalOperator(P1WethProxy.address, true);
  console.log("\x1b[36m%s\x1b[0m", "done tx");
  await perpetualProxy.connect(signers[0]).setGlobalOperator(Test_P1Trader.address, true);
  console.log("\x1b[36m%s\x1b[0m", "done tx");
});
