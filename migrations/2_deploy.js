/*

    Copyright 2024 Axor DAO

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

*/

const {
  getChainId,
  isDevNetwork,
  getChainlinkPriceOracleAddress,
  getMakerPriceOracleAddress,
  getDeployerAddress,
  getOracleAdjustment,
  getChainlinkOracleAdjustmentExponent,
  getInverseOracleAdjustmentExponent,
  getTokenAddress,
  getWethAddress,
  getMinCollateralization,
  getInsuranceFundAddress,
  getInsuranceFee,
  getDeleveragingOperatorAddress,
  getFundingRateProviderAddress,
  getSoloAddress,
} = require('./helpers');

// ============ Constants ============

const SOLO_USDC_MARKET = 2;

// ============ Contracts ============

// Base Protocol
const PerpetualProxy = artifacts.require('PerpetualProxy');
const PerpetualV1 = artifacts.require('PerpetualV1');

// Funding Oracles
const P1FundingOracle = artifacts.require('P1FundingOracle');
const P1InverseFundingOracle = artifacts.require('P1InverseFundingOracle');

// Traders
const P1Orders = artifacts.require('P1Orders');
const P1Liquidation = artifacts.require('P1Liquidation');

// Price Oracles
const P1ChainlinkOracle = artifacts.require('P1ChainlinkOracle');
const P1MakerOracle = artifacts.require('P1MakerOracle');

// Proxies
const P1LiquidatorProxy = artifacts.require('P1LiquidatorProxy');

// Test Contracts
const TestLib = artifacts.require('Test_Lib');
const TestP1Funder = artifacts.require('Test_P1Funder');
const TestP1Monolith = artifacts.require('Test_P1Monolith');
const TestP1Oracle = artifacts.require('Test_P1Oracle');
const TestP1Trader = artifacts.require('Test_P1Trader');
const TestToken = artifacts.require('Test_Token');
const TestToken2 = artifacts.require('Test_Token2');
const TestMakerOracle = artifacts.require('Test_MakerOracle');
const TestChainlinkAggregator = artifacts.require('Test_ChainlinkAggregator');
const WETH9 = artifacts.require('WETH9');

// ============ Main Migration ============

const migration = async (deployer, network, accounts) => {
  await deployTestContracts(deployer, network);
  await deployProtocol(deployer, network, accounts);
  await deployOracles(deployer, network);
  await initializePerpetual(deployer, network);
  await deployTraders(deployer, network);
};

module.exports = migration;

// ============ Deploy Functions ============

async function deployTestContracts(deployer, network) {
  if (isDevNetwork(network)) {
    await Promise.all([
      deployer.deploy(TestLib),
      deployer.deploy(TestP1Funder),
      deployer.deploy(TestP1Monolith),
      deployer.deploy(TestP1Oracle),
      deployer.deploy(TestP1Trader),
      deployer.deploy(TestToken),
      deployer.deploy(TestToken2),
      deployer.deploy(TestMakerOracle),
      deployer.deploy(TestChainlinkAggregator),
      deployer.deploy(WETH9),
    ]);
  }
}

async function deployProtocol(deployer, network, accounts) {
  await deployer.deploy(PerpetualV1);
  await deployer.deploy(
    PerpetualProxy,
    PerpetualV1.address, // logic
    getDeployerAddress(network, accounts), // admin
    '0x', // data
  );
}

async function deployOracles(deployer, network) {
  // Get external oracle addresses.
  const chainlinkOracle = getChainlinkPriceOracleAddress(network, TestChainlinkAggregator);
  const makerOracle = getMakerPriceOracleAddress(network, TestMakerOracle);

  // Deploy funding oracles, Maker oracle wrapper, and Chainlink oracle wrapper.
  await Promise.all([
    deployer.deploy(
      P1FundingOracle,
      getFundingRateProviderAddress(network),
    ),
    deployer.deploy(
      P1InverseFundingOracle,
      getFundingRateProviderAddress(network),
    ),
    deployer.deploy(
      P1ChainlinkOracle,
      chainlinkOracle,
      PerpetualProxy.address,
      getChainlinkOracleAdjustmentExponent(network),
    ),
    deployer.deploy(P1MakerOracle),
  ]);

  // Configure routing and permissions.
  const [oracle] = await Promise.all([
    P1MakerOracle.deployed(),
  ]);
  await Promise.all([
    oracle.setRoute(
      PerpetualProxy.address,
      makerOracle,
    ),
    oracle.setAdjustment(
      makerOracle,
      getOracleAdjustment(network),
    ),
  ]);
}

async function deployTraders(deployer, network) {
  // deploy traders
  await Promise.all([
    deployer.deploy(
      P1Orders,
      PerpetualProxy.address,
      getChainId(network),
    ),
    deployer.deploy(
      P1Liquidation,
      PerpetualProxy.address,
    ),
  ]);

  // deploy proxies
  await Promise.all([
    deployer.deploy(
      P1LiquidatorProxy,
      PerpetualProxy.address,
      P1Liquidation.address,
      getInsuranceFundAddress(network),
      getInsuranceFee(network),
    ),
  ]);

  // initialize proxies on non-testnet
  if (!isDevNetwork(network)) {
    const liquidatorProxy = await P1LiquidatorProxy.deployed();
    await liquidatorProxy.approveMaximumOnPerpetual();

    await soloBridgeProxy.approveMaximumOnPerpetual(PerpetualProxy.address);
    await soloBridgeProxy.approveMaximumOnSolo(SOLO_USDC_MARKET);

    await wethProxy.approveMaximumOnPerpetual(PerpetualProxy.address);
  }

  // set global operators
  const perpetual = await PerpetualV1.at(PerpetualProxy.address);
  await Promise.all([
    perpetual.setGlobalOperator(P1Orders.address, true),
    perpetual.setGlobalOperator(P1Liquidation.address, true),
    perpetual.setGlobalOperator(P1LiquidatorProxy.address, true),
  ]);
  if (isDevNetwork(network)) {
    await perpetual.setGlobalOperator(TestP1Trader.address, true);
  }
}

async function initializePerpetual(deployer, network) {
  const perpetual = await PerpetualV1.at(PerpetualProxy.address);
  if (!isDevNetwork(network)) {
    await perpetual.initializeV1(
      getTokenAddress(network),
      P1MakerOracle.address,
      P1FundingOracle.address,
      getMinCollateralization(network),
    );
  }
}
