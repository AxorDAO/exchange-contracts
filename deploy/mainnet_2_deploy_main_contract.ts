import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

const DAY_IN_SECONDS = 60 * 60 * 24;
const NOW_IN_SECONDS = Math.round(Date.now() / 1000);
const UNLOCK_IN_X_DAYS = NOW_IN_SECONDS + DAY_IN_SECONDS * 1; // 1 DAY

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;
  const signers = await hre.ethers.getSigners();
  const multisendAddress = "";
  const usdcAddress = "";
  const oracleAddress = "";


  const PerpetualV1Impl = await deploy('PerpetualV1', {
    from: deployer,
    args: [],
    log: true,
  });
  console.log('contract address for PerpetualV1', PerpetualV1Impl.address);

  const PerpetualV1 = await deploy('PerpetualProxy', {
    from: deployer,
    args: [PerpetualV1Impl.address, deployer, '0x'],
    log: true,
  });


  const P1FundingOracle = await deploy('P1FundingOracle', {
    from: deployer,
    args: [deployer],
    log: true,
  });

  const p1FundOracle = await hre.ethers.getContractAt('P1FundingOracle', P1FundingOracle.address);
  const setFundingProvider = await p1FundOracle.connect(signers[0]).setFundingRateProvider(signers[0].address);
  await setFundingProvider.wait();

  // const P1ChainlinkOracle = await deploy('P1ChainlinkOracle', {
  //   from: deployer,
  //   args: [Test_ChainlinkAggregator.address, PerpetualV1.address, '28'],
  //   log: true,
  // });
  // console.log('contract address for P1FundingOracle', P1ChainlinkOracle.address);

  const chainlinkOracle = await deploy('P1ChainlinkOracle', {
    from: deployer,
    args: [
      oracleAddress,
      PerpetualV1.address,
      16
    ],
    log: true,
  });
  console.log('contract address for PerpetualV1', chainlinkOracle.address);

  // /* @ts-ignore */
  // const tx =  await perpetual.connect(signers[0]).setOracle(chainlinkOracle.address);
  // await tx.wait();

  // / ==================== INIT PERPETUAL ===================== ///
  const perpetual = await hre.ethers.getContractAt('PerpetualV1', PerpetualV1.address);
  console.log('\x1b[36m%s\x1b[0m', 'data', await perpetual.getAdmin());
  const tx= await perpetual
    .connect(signers[0])
    .initializeV1(usdcAddress, chainlinkOracle.address, P1FundingOracle.address, "1100000000000000000", {});

  await tx.wait();

  // / ==================== DEPLOY TRADER ===================== ///
  const P1Orders = await deploy('P1Orders', {
    from: deployer,
    args: [PerpetualV1.address, 42161],
    log: true,
  });
  console.log('contract address for P1Orders', P1Orders.address);


  const P1Liquidation = await deploy('P1Liquidation', {
    from: deployer,
    args: [PerpetualV1.address],
    log: true,
  });
  console.log('contract address for P1Liquidation', P1Liquidation.address);

  console.log('contract address for PerpetualV1', PerpetualV1.address);
  console.log('contract address for P1FundingOracle', P1FundingOracle.address);
  console.log('contract address for chainlinkOracle', chainlinkOracle.address);
  console.log('contract address for P1Orders', P1Orders.address);
  console.log('contract address for P1Liquidation', P1Liquidation.address);
  console.log('contract address for Multisend', multisendAddress);

  tx = await perpetual.connect(signers[0]).setGlobalOperator(P1Orders.address, true);
  await tx.wait();
  tx = await perpetual.connect(signers[0]).setGlobalOperator(P1Liquidation.address, true);
  await tx.wait();

  tx = await perpetual.connect(signers[0]).setGlobalOperator(multisendAddress, true);
  await tx.wait();

  console.log('\x1b[36m%s\x1b[0m', '================= DONE DEPLOY ==============');
};

export default func;
func.id = 'deploy_main_contract'; // id required to prevent reexecution
func.tags = ['MainContract'];
