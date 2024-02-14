import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const DAY_IN_SECONDS = 60 * 60 * 24;
const NOW_IN_SECONDS = Math.round(Date.now() / 1000);
const UNLOCK_IN_X_DAYS = NOW_IN_SECONDS + DAY_IN_SECONDS * 1; // 1 DAY

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const lockedAmount = hre.ethers.parseEther("0.01").toString();

  const Test_Lib = await deploy("Test_Lib", {
    from: deployer,
    args: [],
    log: true,
  });

  const Test_P1Funder = await deploy("Test_P1Funder", {
    from: deployer,
    args: [],
    log: true,
  });

  const Test_P1Monolith = await deploy("Test_P1Monolith", {
    from: deployer,
    args: [],
    log: true,
  });

  const Test_P1Oracle = await deploy("Test_P1Oracle", {
    from: deployer,
    args: [],
    log: true,
  });
  const Test_P1Trader = await deploy("Test_P1Trader", {
    from: deployer,
    args: [],
    log: true,
  });
  const Test_Token = await deploy("Test_Token", {
    from: deployer,
    args: [],
    log: true,
  });
  const Test_Token2 = await deploy("Test_Token2", {
    from: deployer,
    args: [],
    log: true,
  });
  const Test_MakerOracle = await deploy("Test_MakerOracle", {
    from: deployer,
    args: [],
    log: true,
  });
  const Test_ChainlinkAggregator = await deploy("Test_ChainlinkAggregator", {
    from: deployer,
    args: [],
    log: true,
  });
  const WETH9 = await deploy("WETH9", {
    from: deployer,
    args: [],
    log: true,
  });
  console.log("contract address for Test_Lib", Test_Lib.address);
  console.log("contract address for Test_P1Funder", Test_P1Funder.address);
  console.log("contract address for Test_P1Monolith", Test_P1Monolith.address);
  console.log("contract address for Test_P1Oracle", Test_P1Oracle.address);
  console.log("contract address for Test_P1Trader", Test_P1Trader.address);
  console.log("contract address for Test_Token2", Test_Token2.address);
  console.log("contract address for Test_Token", Test_Token.address);
  console.log("contract address for Test_MakerOracle", Test_MakerOracle.address);
  console.log("contract address for Test_ChainlinkAggregator", Test_ChainlinkAggregator.address);
  console.log("contract address for WETH9", WETH9.address);
};
export default func;
func.id = "deploy_lock"; // id required to prevent reexecution
func.tags = ["Lock"];
