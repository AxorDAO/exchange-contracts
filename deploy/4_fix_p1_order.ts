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
  const chainID = 421614;

  const PerpetualV1Address = "0x08b65799C8edb1F8B2fbf470528F09f88a5dAA8B";
  // / ==================== INIT PERPETUAL ===================== ///
  const perpetual = await hre.ethers.getContractAt('PerpetualV1', PerpetualV1Address);


  // / ==================== DEPLOY TRADER ===================== ///
  const P1Orders = await deploy('P1Orders', {
    from: deployer,
    args: [PerpetualV1Address, chainID],
    log: true,
  });
  console.log('contract address for P1Orders', P1Orders.address);


  const tx = await perpetual.connect(signers[0]).setGlobalOperator(P1Orders.address, true);
  await tx.wait();

  console.log('\x1b[36m%s\x1b[0m', '================= DONE DEPLOY ==============');
};

export default func;
func.id = 'fix'; // id required to prevent reexecution
func.tags = ['fix'];
