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

import Web3 from 'web3';
import {
  address,
  EthereumAccount,
  Networks,
  Provider,
  PerpetualMarket,
  PerpetualOptions,
  SendOptions,
} from './lib/types';
import { Contracts } from './modules/Contracts';
import { Logs } from './modules/Logs';
import { Proxy } from './modules/Proxy';
import { Admin } from './modules/Admin';
import { FinalSettlement } from './modules/FinalSettlement';
import { FundingOracle } from './modules/FundingOracle';
import { InverseFundingOracle } from './modules/InverseFundingOracle';
import { PriceOracle } from './modules/PriceOracle';
import { MakerPriceOracle } from './modules/MakerPriceOracle';
import { Relayer } from './modules/Relayer';
import { Liquidation } from './modules/Liquidation';
import { LiquidatorProxy } from './modules/LiquidatorProxy';
import { Getters } from './modules/Getters';
import { Margin } from './modules/Margin';
import { Operator } from './modules/Operator';
import { Orders } from './modules/Orders';
import { Token } from './modules/Token';
import { Trade } from './modules/Trade';
import { Weth } from './modules/Weth';
import { Api } from './modules/Api';

export class Perpetual {
  public web3: Web3;
  public contracts: Contracts;
  public market: PerpetualMarket;

  // Client modules.
  public proxy: Proxy;
  public admin: Admin;
  public finalSettlement: FinalSettlement;
  public fundingOracle: FundingOracle;
  public priceOracle: PriceOracle;
  public relayer: Relayer;
  public liquidation: Liquidation;
  public liquidatorProxy: LiquidatorProxy;
  public getters: Getters;
  public logs: Logs;
  public margin: Margin;
  public operator: Operator;
  public orders: Orders;
  public token: Token;
  public trade: Trade;
  public weth: Weth;
  public api: Api;

  constructor(
    provider: Provider,
    market: PerpetualMarket,
    networkId: number = Networks.MAINNET,
    options: PerpetualOptions = {},
  ) {
    this.web3 = new Web3(provider);
    this.contracts = this.getContracts(provider, market, networkId, options.sendOptions);
    this.market = market;

    // Client modules.
    this.proxy = new Proxy(this.contracts);
    this.admin = new Admin(this.contracts);
    this.finalSettlement = new FinalSettlement(this.contracts);
    this.relayer = new Relayer(this.contracts, this.web3);
    this.liquidation = new Liquidation(this.contracts);
    this.liquidatorProxy = new LiquidatorProxy(this.contracts);
    this.getters = new Getters(this.contracts);
    this.logs = new Logs(this.contracts, this.web3);
    this.margin = new Margin(this.contracts);
    this.operator = new Operator(this.contracts);
    this.token = new Token(this.contracts);
    this.weth = new Weth(this.contracts);

    // Use different modules/contracts depending on the market.
    if (this.isInverse()) {
      this.fundingOracle = new InverseFundingOracle(this.contracts);
    } else {
      this.orders = new Orders(this.contracts, this.web3);
      this.fundingOracle = new FundingOracle(this.contracts);
    }
    if (this.usesMakerOracle()) {
      this.priceOracle = new MakerPriceOracle(this.contracts);
    } else {
      this.priceOracle = new PriceOracle(this.contracts);
    }

    // Client modules that rely on this.orders.
    this.trade = new Trade(this.contracts, this.orders);
    this.api = new Api(this.orders, options.apiOptions);

    if (options.accounts) {
      options.accounts.forEach(a => this.loadAccount(a));
    }
  }

  get makerPriceOracle(): MakerPriceOracle {
    if (this.usesMakerOracle()) {
      return this.priceOracle as MakerPriceOracle;
    }
    throw new Error('Market does not use a Maker price oracle');
  }

  public isInverse(): boolean {
    return this.market === PerpetualMarket.WETH_PUSD;
  }

  public usesMakerOracle(): boolean {
    return [PerpetualMarket.PBTC_USDC, PerpetualMarket.WETH_PUSD].includes(this.market);
  }

  public setProvider(
    provider: Provider,
    networkId: number = Networks.MAINNET,
  ): void {
    this.web3.setProvider(provider);
    this.contracts.setProvider(provider, networkId);
  }

  public setDefaultAccount(
    account: address,
  ): void {
    this.web3.eth.defaultAccount = account;
    this.contracts.setDefaultAccount(account);
  }

  public getDefaultAccount(): address {
    return this.web3.eth.defaultAccount;
  }

  public loadAccount(
    account: EthereumAccount,
  ): void {
    const newAccount = this.web3.eth.accounts.wallet.add(
      account.privateKey,
    );

    if (
      !newAccount
      || (
        account.address
        && account.address.toLowerCase() !== newAccount.address.toLowerCase()
      )
    ) {
      throw new Error(`Loaded account address mismatch.
        Expected ${account.address}, got ${newAccount ? newAccount.address : null}`);
    }
  }

  // ============ Helper Functions ============

  protected getContracts(
    provider: Provider,
    market: PerpetualMarket,
    networkId: number,
    sendOptions?: SendOptions,
  ): Contracts {
    return new Contracts(
      provider,
      market,
      networkId,
      this.web3,
      sendOptions,
    );
  }
}
