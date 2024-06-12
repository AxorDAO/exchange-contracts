import { ethers } from "hardhat";

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

export async function deployTestPerpetualFixture() {
  const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
  const ONE_GWEI = 1_000_000_000;

  // Contracts are deployed using the first signer/account by default
  const [owner, otherAccount] = await ethers.getSigners();

  const Test_Lib = (await ethers.getContractFactory("Test_Lib")) as Test_Lib__factory;
  const Test_P1Funder = (await ethers.getContractFactory("Test_P1Funder")) as Test_P1Funder__factory;
  const Test_P1Oracle = (await ethers.getContractFactory("Test_P1Oracle")) as Test_P1Oracle__factory;
  const Test_P1Trader = (await ethers.getContractFactory("Test_P1Trader")) as Test_P1Trader__factory;
  const Test_Token = (await ethers.getContractFactory("Test_Token")) as Test_Token__factory;
  const Test_Token2 = (await ethers.getContractFactory("Test_Token2")) as Test_Token2__factory;
  const Test_MakerOracle = (await ethers.getContractFactory("Test_MakerOracle")) as Test_MakerOracle__factory;
  const Test_ChainlinkAggregator = (await ethers.getContractFactory(
    "Test_ChainlinkAggregator",
  )) as Test_ChainlinkAggregator__factory;


  const test_Lib = (await Test_Lib.deploy()) as Test_Lib;
  const test_P1Funder = (await Test_P1Funder.deploy()) as Test_P1Funder;
  const test_P1Oracle = (await Test_P1Oracle.deploy()) as Test_P1Oracle;
  const test_P1Trader = (await Test_P1Trader.deploy()) as Test_P1Trader;
  const test_Token = (await Test_Token.deploy()) as Test_Token;
  const test_Token2 = (await Test_Token2.deploy()) as Test_Token2;
  const test_MakerOracle = (await Test_MakerOracle.deploy()) as Test_MakerOracle;
  const test_ChainlinkAggregator = (await Test_ChainlinkAggregator.deploy()) as Test_ChainlinkAggregator;

  /// ==================== MAIN CONTRACT ====================
  const PerpetualV1Impl = (await ethers.getContractFactory("PerpetualV1")) as PerpetualV1__factory;
  const PerpetualV1 = (await ethers.getContractFactory("PerpetualProxy")) as PerpetualProxy__factory;
  const P1FundingOracle = (await ethers.getContractFactory("P1FundingOracle")) as P1FundingOracle__factory;
  const P1ChainlinkOracle = (await ethers.getContractFactory("P1ChainlinkOracle")) as P1ChainlinkOracle__factory;
  const P1MakerOracle = (await ethers.getContractFactory("P1MakerOracle")) as P1MakerOracle__factory;
  const P1Orders = (await ethers.getContractFactory("P1Orders")) as P1Orders__factory;
  const P1Liquidation = (await ethers.getContractFactory("P1Liquidation")) as P1Liquidation__factory;

  const P1LiquidatorProxy = (await ethers.getContractFactory("P1LiquidatorProxy")) as P1LiquidatorProxy__factory;

  const perpetualV1Impl = (await PerpetualV1Impl.deploy()) as PerpetualV1;
  const perpetualV1Proxy = (await PerpetualV1.deploy(
    await perpetualV1Impl.getAddress(),
    owner,
    "0x",
  )) as unknown as PerpetualV1;
  const perpetualV1 = perpetualV1Impl.attach(await perpetualV1Proxy.getAddress()) as PerpetualV1;
  const p1FundingOracle = (await P1FundingOracle.deploy(
    "0x0000000000000000000000000000000000000000",
  )) as P1FundingOracle;
  const p1ChainlinkOracle = (await P1ChainlinkOracle.deploy(
    await test_ChainlinkAggregator.getAddress(),
    await perpetualV1Impl.getAddress(),
    "28",
  )) as P1ChainlinkOracle;
  const p1MakerOracle = (await P1MakerOracle.deploy()) as P1MakerOracle;

  await p1MakerOracle.connect(owner).setRoute(await perpetualV1.getAddress(), await test_MakerOracle.getAddress());
  await p1MakerOracle.connect(owner).setAdjustment(await test_MakerOracle.getAddress(), "1000000000000000000");
  await perpetualV1
    .connect(owner)
    .initializeV1(await test_Token.getAddress(), await p1MakerOracle.getAddress(), await p1FundingOracle.getAddress(), "1100000000000000000", {});

  const p1Orders = (await P1Orders.deploy(await perpetualV1.getAddress(), 1337)) as P1Orders;
  const p1Liquidation = (await P1Liquidation.deploy(await perpetualV1.getAddress())) as P1Liquidation;
  const p1LiquidatorProxy = (await P1LiquidatorProxy.deploy(
    await perpetualV1.getAddress(),
    await p1Liquidation.getAddress(),
    "0x0000000000000000000000000000000000000000",
    "100000000000000000",
  )) as P1LiquidatorProxy;

  /// ==================== INIT CONTRACT DATA ====================
  await p1LiquidatorProxy.connect(owner).approveMaximumOnPerpetual();

  await perpetualV1.connect(owner).setGlobalOperator(await p1Orders.getAddress(), true);
  await perpetualV1.connect(owner).setGlobalOperator(await p1Liquidation.getAddress(), true);
  await perpetualV1.connect(owner).setGlobalOperator(await p1LiquidatorProxy.getAddress(), true);
  await perpetualV1.connect(owner).setGlobalOperator(await test_P1Trader.getAddress(), true);
  await perpetualV1.connect(owner).setGlobalOperator(owner.address, true);

  console.log(await perpetualV1.getAddress());
  

  console.log("\x1b[36m%s\x1b[0m", "================= DONE DEPLOY ==============");


  return {
    _test_Lib: test_Lib,
    _test_P1Funder: test_P1Funder,
    _test_P1Oracle: test_P1Oracle,
    _test_P1Trader: test_P1Trader,
    _test_Token: test_Token,
    _test_Token2: test_Token2,
    _test_MakerOracle: test_MakerOracle,
    _test_ChainlinkAggregator: test_ChainlinkAggregator,
    _perpetualV1Impl: perpetualV1Impl,
    _perpetualV1: perpetualV1,
    _p1FundingOracle: p1FundingOracle,
    _p1ChainlinkOracle: p1ChainlinkOracle,
    _p1MakerOracle: p1MakerOracle,
    _p1Orders: p1Orders,
    _p1Liquidation: p1Liquidation,
    _p1LiquidatorProxy: p1LiquidatorProxy,
  };
}
