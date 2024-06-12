import { parseEther } from "ethers";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("deposit", "deposit collateral").setAction(async function (_, hre) {
  const { ethers, deployments } = hre;

  const PerpetualProxy = await deployments.get("PerpetualProxy");
  const Test_Token = await deployments.get("Test_Token");
  const Test_MakerOracle = await deployments.get("Test_MakerOracle");
  const testToken = await ethers.getContractAt("Test_Token", Test_Token.address);
  const testMakerOracle = await ethers.getContractAt("Test_MakerOracle", Test_MakerOracle.address);
  const perpetualProxy = await ethers.getContractAt("PerpetualV1", PerpetualProxy.address);
  const signers = await ethers.getSigners();

  await testToken.mint(signers[0].address, parseEther("1000"));
  await testToken.approve(PerpetualProxy.address, parseEther("1000"));
  await testMakerOracle.setPrice(parseEther("1"));
  await perpetualProxy.deposit(signers[0].address, parseEther("10"));
});

task("withdraw", "withdraw collateral").setAction(async function (_, hre) {
  const { ethers, deployments } = hre;

  const PerpetualProxy = await deployments.get("PerpetualProxy");
  const Test_Token = await deployments.get("Test_Token");
  const Test_MakerOracle = await deployments.get("Test_MakerOracle");
  const perpetualProxy = await ethers.getContractAt("PerpetualV1", PerpetualProxy.address);
  const signers = await ethers.getSigners();

  const balance = await perpetualProxy.getAccountBalance(signers[0].address);
  console.log("🚀 ~ file: margin.ts:35 ~ balance:", balance);

  await perpetualProxy.withdraw(signers[0].address, signers[0].address, parseEther("8"));

  const postBalance = await perpetualProxy.getAccountBalance(signers[0].address);
  console.log("🚀 ~ file: margin.ts:35 ~ balance:", postBalance);
});
