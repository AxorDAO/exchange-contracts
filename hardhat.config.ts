import '@nomicfoundation/hardhat-toolbox';
// import "@nomiclabs/hardhat-waffle";
// import "@nomiclabs/hardhat-etherscan";
// import "@typechain/hardhat";
import { config as dotEnvConfig } from "dotenv";
// import { readdirSync } from "fs";
// import "hardhat-contract-sizer";
// import "hardhat-deploy";
import 'hardhat-deploy';
import { vars, HardhatUserConfig } from 'hardhat/config';
import { NetworkUserConfig } from 'hardhat/types';
import '@nomiclabs/hardhat-web3';
dotEnvConfig();

import "./tasks/accounts";
import "./tasks/margin";
import "./tasks/init";
import "./tasks/trade";


// Run 'npx hardhat vars setup' to see the list of variables that need to be set

const privateKey = process.env.PVK; // 992725....
console.log("🚀 ~ privateKey:", privateKey)
const privateKey1 = process.env.PVK_GNC; // 992725....
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
  arb: 421614
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
    case 'arb':
      jsonRpcUrl = 'https://sepolia-rollup.arbitrum.io/rpc	';
      break;

    case 'arbitrum-mainnet':
      jsonRpcUrl = 'https://arbitrum.blockpi.network/v1/rpc/public';
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
      arbsepolia: "89ZPWUKVNGY13JPGAH5TFVADAAI8N53S9F",
    },
    customChains: [
      {
        network: 'arbsepolia',
        chainId: 421614,
        urls: {
          apiURL: 'https://api-sepolia.arbiscan.io/api',
          browserURL: 'https://sepolia.arbiscan.io/',
        }
      }
    ]
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
    bsctest: getChainConfig('bsctestnet'),
    bsctest2: getChainConfig('bsctestnet'),
    bsctest3: getChainConfig('bsctestnet'),
    bsctest4: getChainConfig('bsctestnet'),
    bsctest5: getChainConfig('bsctestnet'),
    arb: getChainConfig('arb'),
    arb1: getChainConfig('arb'),
    arb2: getChainConfig('arb'),
    arb3: getChainConfig('arb'),
    arb4: getChainConfig('arb'),
    cdarb1: getChainConfig('arb'),
    cdarb2: getChainConfig('arb'),
    cdarb3: getChainConfig('arb'),
    cdarb4: getChainConfig('arb'),
    ctarb1: getChainConfig('arb'),
    ctarb2: getChainConfig('arb'),
    ctarb3: getChainConfig('arb'),
    ctarb4: getChainConfig('arb'),
    ctarbxxx: getChainConfig('arb'),
    ctarbx: getChainConfig('arb'),
    a1: getChainConfig('arb'),
  },
  paths: {
    artifacts: './artifacts',
    cache: './cache',
    sources: './contracts',
    tests: './test/axor',
  },
  solidity: {
    compilers:
    [
      {
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
      {
        version: "0.8.3",
        settings: {
          optimizer: {
            enabled: true,
            runs: 800,
          },
        },
      }
    ]
  },
  typechain: {
    outDir: 'types',
    target: 'ethers-v6',
  }
};

export default config;
