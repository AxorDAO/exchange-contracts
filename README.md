## Development

### Install

node version: v16.20.2

```
npm i --force
```

### Compile Contracts

Requires a running [docker](https://docker.com) engine.
```
  truffle compile
```
### Deploy contracts
```
  yarn hardhat deploy --network network
```
### Run unit test
1. Run ganache with chain id = 1001
```
  ganache-cli --networkId 1001
```

2. Run unit test
```
  npm test
```
