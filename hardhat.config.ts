import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-deploy';
import { vars, HardhatUserConfig } from 'hardhat/config';
import { NetworkUserConfig } from 'hardhat/types';
import '@nomiclabs/hardhat-web3';

// Run 'npx hardhat vars setup' to see the list of variables that need to be set

const privateKey = ''; // 992725....
const privateKey1 = ''; // 992725....
const infuraApiKey: string = 'INFURA_API_KEY';

const chainIds = {
  'arbitrum-mainnet': 42161,
  avalanche: 43114,
  bsc: 56,
  ganache: 1337,
  hardhat: 31337,
  mainnet: 1,
  'optimism-mainnet': 10,
  'polygon-mainnet': 137,
  'polygon-mumbai': 80001,
  sepolia: 11155111,
  bsctestnet: 97,
};

function getChainConfig(chain: keyof typeof chainIds): NetworkUserConfig {
  let jsonRpcUrl: string;
  switch (chain) {
    case 'avalanche':
      jsonRpcUrl = 'https://api.avax.network/ext/bc/C/rpc';
      break;
    case 'bsc':
      jsonRpcUrl = 'https://bsc-dataseed1.binance.org';
      break;
    case 'bsctestnet':
      jsonRpcUrl = 'https://bsc-testnet.publicnode.com	';
      break;
    default:
      // tslint:disable-next-line:prefer-template
      jsonRpcUrl = 'https://' + chain + '.infura.io/v3/' + infuraApiKey;
  }
  return {
    accounts: [`0x${privateKey}`],
    chainId: chainIds[chain],
    url: jsonRpcUrl,
  };
}

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  namedAccounts: {
    deployer: 0,
  },
  etherscan: {
    apiKey: {
      arbitrumOne: vars.get('ARBISCAN_API_KEY', ''),
      avalanche: vars.get('SNOWTRACE_API_KEY', ''),
      bsc: vars.get('BSCSCAN_API_KEY', ''),
      mainnet: vars.get('ETHERSCAN_API_KEY', ''),
      optimisticEthereum: vars.get('OPTIMISM_API_KEY', ''),
      polygon: vars.get('POLYGONSCAN_API_KEY', ''),
      polygonMumbai: vars.get('POLYGONSCAN_API_KEY', ''),
      sepolia: vars.get('ETHERSCAN_API_KEY', ''),
    },
  },
  gasReporter: {
    currency: 'USD',
    enabled: process.env.REPORT_GAS ? true : false,
    excludeContracts: [],
    src: './contracts',
  },
  networks: {
    hardhat: {
      // accounts: {
      //   mnemonic,
      // },
      chainId: chainIds.hardhat,
    },
    ganache: {
      accounts: [`0x${privateKey}`, `0x${privateKey1}`],
      chainId: chainIds.ganache,
      url: 'http://localhost:7545',
    },
    arbitrum: getChainConfig('arbitrum-mainnet'),
    avalanche: getChainConfig('avalanche'),
    bsc: getChainConfig('bsc'),
    mainnet: getChainConfig('mainnet'),
    optimism: getChainConfig('optimism-mainnet'),
    'polygon-mainnet': getChainConfig('polygon-mainnet'),
    'polygon-mumbai': getChainConfig('polygon-mumbai'),
    sepolia: getChainConfig('sepolia'),
    bsctestnet: getChainConfig('bsctestnet'),
  },
  paths: {
    artifacts: './artifacts',
    cache: './cache',
    sources: './contracts',
    tests: './test',
  },
  solidity: {
    version: '0.5.16',
    settings: {
      // Disable the optimizer when debugging
      // https://hardhat.org/hardhat-network/#solidity-optimizer-support
      optimizer: {
        enabled: true,
        runs: 800,
      },
    },
  },
  typechain: {
    outDir: 'types',
    target: 'ethers-v6',
  },
};

export default config;
