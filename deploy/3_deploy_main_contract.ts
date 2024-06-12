import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

const DAY_IN_SECONDS = 60 * 60 * 24;
const NOW_IN_SECONDS = Math.round(Date.now() / 1000);
const UNLOCK_IN_X_DAYS = NOW_IN_SECONDS + DAY_IN_SECONDS * 1; // 1 DAY

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  console.log('🚀 ~ file: 2_deploy_main_contract.ts:11 ~ deployer:', deployer);
  const { deploy, get } = hre.deployments;
  const signers = await hre.ethers.getSigners();
  console.log('🚀 ~ file: 2_deploy_main_contract.ts:14 ~ signers:', signers[0]);
  // const signers  = [deployer];

  // const Test_ChainlinkAggregator = await get('Test_ChainlinkAggregator');
  const Test_MakerOracle = await get('Test_MakerOracle');
  // const Multisend = await get('MultiSendProxy_Proxy');
  // const multisendAddress = Multisend.address;
  const multisendAddress = "0x339c2B65A45CCc35A0eD013A865E332486C31C7B";
  // const WETH9 = await get('WETH9');
  const Test_P1Trader = await get('Test_P1Trader');
  const Test_Token = await get('Test_Token');
  const Test_Token_address = "0xC81a8e7B945928cD949dA339Ef703BF338D1CE58";
  // const Test_Token_address = Test_Token.address;

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

  const P1MakerOracle = await deploy('P1MakerOracle', {
    from: deployer,
    args: [],
    log: true,
  });

  // get deployed contract
  const oracle = await hre.ethers.getContractAt('P1MakerOracle', P1MakerOracle.address);
  console.log("🚀 ~ oracle:", oracle)
  let tx = await oracle.connect(signers[0]).setRoute(PerpetualV1.address, Test_MakerOracle.address);
  await tx.wait();
  tx = await oracle.connect(signers[0]).setAdjustment(Test_MakerOracle.address, "1000000000000000000");
  await tx.wait();
  // // await mirror.connect(signers[0])["kiss(address)"](P1MakerOracle.address);
  // console.log('\x1b[36m%s\x1b[0m', '======== DONE SET ROUTE ============');

  // / ==================== INIT PERPETUAL ===================== ///
  const perpetual = await hre.ethers.getContractAt('PerpetualV1', PerpetualV1.address);
  console.log('\x1b[36m%s\x1b[0m', 'data', await perpetual.getAdmin());
  tx= await perpetual
    .connect(signers[0])
    .initializeV1(Test_Token_address, P1MakerOracle.address, P1FundingOracle.address, "1100000000000000000", {});

  await tx.wait();

  // / ==================== DEPLOY TRADER ===================== ///
  const P1Orders = await deploy('P1Orders', {
    from: deployer,
    args: [PerpetualV1.address, 421614],
    log: true,
  });
  console.log('contract address for P1Orders', P1Orders.address);


  const P1Liquidation = await deploy('P1Liquidation', {
    from: deployer,
    args: [PerpetualV1.address],
    log: true,
  });
  console.log('contract address for P1Liquidation', P1Liquidation.address);


  const P1LiquidatorProxy = await deploy('P1LiquidatorProxy', {
    from: deployer,
    log: true,
    args: [
      PerpetualV1.address,
      P1Liquidation.address,
      '0x0000000000000000000000000000000000000000',
      '100000000000000000',
    ],
  });
  console.log('contract address for PerpetualV1', PerpetualV1.address);
  console.log('contract address for P1FundingOracle', P1FundingOracle.address);
  console.log('contract address for P1MakerOracle', P1MakerOracle.address);
  console.log('contract address for P1LiquidatorProxy', P1LiquidatorProxy.address);
  console.log('contract address for P1Orders', P1Orders.address);
  console.log('contract address for P1Liquidation', P1Liquidation.address);
  console.log('contract address for Multisend', multisendAddress);
  const liquidatorProxy = await hre.ethers.getContractAt('P1LiquidatorProxy', P1LiquidatorProxy.address);

  tx = await liquidatorProxy.connect(signers[0]).approveMaximumOnPerpetual();
  await tx.wait();

  tx = await perpetual.connect(signers[0]).setGlobalOperator(P1Orders.address, true);
  await tx.wait();
  tx = await perpetual.connect(signers[0]).setGlobalOperator(P1Liquidation.address, true);
  await tx.wait();
  tx = await perpetual.connect(signers[0]).setGlobalOperator(P1LiquidatorProxy.address, true);
  await tx.wait();

  tx = await perpetual.connect(signers[0]).setGlobalOperator(Test_P1Trader.address, true);
  await tx.wait();
  tx = await perpetual.connect(signers[0]).setGlobalOperator(multisendAddress, true);
  await tx.wait();

  console.log('\x1b[36m%s\x1b[0m', '================= DONE DEPLOY ==============');
};

export default func;
func.id = 'deploy_main_contract_test'; // id required to prevent reexecution
func.tags = ['MainContractTest'];