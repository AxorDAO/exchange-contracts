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
  const multisendAddress = "0xEA62840282cdbd34E052a7ae2f410aA171BbDc4b";
  // const WETH9 = await get('WETH9');
  const Test_P1Trader = await get('Test_P1Trader');
  const Test_Token = await get('Test_Token');
  const Test_Token_address = "0xE70Bb9c62F385e23798A952d6C17c4bc4651730c";
  // const Test_Token_address = Test_Token.address;

  const proxyAddress = "0xb43E73f4062C68053C61b9292745a311726d37d5";
  const oracleAddress = "0x72F48eBe69eB7f5DdA2394C9EA488e621727f8B1";
  // / ==================== INIT PERPETUAL ===================== ///
  const perpetual = await hre.ethers.getContractAt('PerpetualV1', proxyAddress);

  console.log(signers[0]);
  

  // / ==================== DEPLOY TRADER ===================== ///
  const chainlinkOracle = await deploy('P1ChainlinkOracle', {
    from: deployer,
    args: [
      oracleAddress,
      proxyAddress,
      16
    ],
    log: true,
  });
  console.log('contract address for PerpetualV1', chainlinkOracle.address);

  /* @ts-ignore */
  const tx =  await perpetual.connect(signers[0]).setOracle(chainlinkOracle.address);
  await tx.wait();

  console.log('\x1b[36m%s\x1b[0m', '================= DONE DEPLOY ==============');
};

export default func;
func.id = 'fix'; // id required to prevent reexecution
func.tags = ['o-fix'];
