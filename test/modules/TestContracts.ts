import _ from 'lodash';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';

import { Contracts } from '../../src/modules/Contracts';
import { PerpetualMarket, Provider, SendOptions } from '../../src/lib/types';

// JSON
const jsonFolder = `../../${process.env.COVERAGE ? '.coverage_artifacts' : 'build'}/contracts/`;
const perpetualProxyJson = require(`${jsonFolder}PerpetualProxy.json`);
const perpetualV1Json = require(`${jsonFolder}PerpetualV1.json`);
const p1FundingOracleJson = require(`${jsonFolder}P1FundingOracle.json`);
const p1InverseFundingOracleJson = require(`${jsonFolder}P1InverseFundingOracle.json`);
const p1ChainlinkOracleJson = require(`${jsonFolder}P1ChainlinkOracle.json`);
const p1MakerOracleJson = require(`${jsonFolder}P1MakerOracle.json`);
const p1OrdersJson = require(`${jsonFolder}P1Orders.json`);
const p1LiquidationJson = require(`${jsonFolder}P1Liquidation.json`);
const p1LiquidatorProxyJson = require(`${jsonFolder}P1LiquidatorProxy.json`);

// Test Contract JSON
const testLibJson = require(`${jsonFolder}Test_Lib.json`);
const testP1FunderJson = require(`${jsonFolder}Test_P1Funder.json`);
const testP1MonolithJson = require(`${jsonFolder}Test_P1Monolith.json`);
const testP1OracleJson = require(`${jsonFolder}Test_P1Oracle.json`);
const testP1TraderJson = require(`${jsonFolder}Test_P1Trader.json`);
const testTokenJson = require(`${jsonFolder}Test_Token.json`);
const testToken2Json = require(`${jsonFolder}Test_Token2.json`);
const testChainlinkAggregatorJson = require(`${jsonFolder}Test_ChainlinkAggregator.json`);
const testMakerOracleJson = require(`${jsonFolder}Test_MakerOracle.json`);
const wethJson  = require(`${jsonFolder}/WETH9.json`);

export class TestContracts extends Contracts {

  // Test contract instances
  public testExchangeWrapper: Contract;
  public testLib: Contract;
  public testP1Funder: Contract;
  public testP1Monolith: Contract;
  public testP1Oracle: Contract;
  public testP1Trader: Contract;
  public testSolo: Contract;
  public testToken: Contract;
  public testToken2: Contract;
  public testChainlinkAggregator: Contract;
  public testMakerOracle: Contract;

  constructor(
    provider: Provider,
    market: PerpetualMarket,
  networkId: number,
    web3: Web3,
    sendOptions: SendOptions = {},
  ) {
    super(provider, market, networkId, web3, sendOptions);

    // Re-assign the JSON for contracts
    this.contractsList = [];
    this.perpetualProxy = this.addContract(perpetualProxyJson);
    this.perpetualV1 = this.addContract(perpetualV1Json);
    this.p1FundingOracle = this.addContract(p1FundingOracleJson);
    this.p1InverseFundingOracle = this.addContract(p1InverseFundingOracleJson);
    this.p1ChainlinkOracle = this.addContract(p1ChainlinkOracleJson);
    this.p1MakerOracle = this.addContract(p1MakerOracleJson);
    this.p1Orders = this.addContract(p1OrdersJson);
    this.p1Liquidation = this.addContract(p1LiquidationJson);
    this.p1LiquidatorProxy = this.addContract(p1LiquidatorProxyJson);
    this.weth = this.addContract(wethJson);

    // Test contracts
    this.testLib = this.addContract(testLibJson, true);
    this.testP1Funder = this.addContract(testP1FunderJson, true);
    this.testP1Monolith = this.addContract(testP1MonolithJson, true);
    this.testP1Oracle = this.addContract(testP1OracleJson, true);
    this.testP1Trader = this.addContract(testP1TraderJson, true);
    this.testToken = this.addContract(testTokenJson, true);
    this.testToken2 = this.addContract(testToken2Json, true);
    this.testChainlinkAggregator = this.addContract(testChainlinkAggregatorJson, true);
    this.testMakerOracle = this.addContract(testMakerOracleJson, true);

    this.setProvider(provider, networkId);
    this.setDefaultAccount(this.web3.eth.defaultAccount);
  }
}
