# Safe Deployments

[![npm version](https://badge.fury.io/js/%40safe-global%2Fsafe-deployments.svg)](https://badge.fury.io/js/%40safe-global%2Fsafe-deployments)
[![CI](https://github.com/safe-global/safe-deployments/actions/workflows/test.yml/badge.svg)](https://github.com/safe-global/safe-deployments/actions/workflows/test.yml)

This contract contains a collection of deployments of the contract of the [Safe contracts repository](https://github.com/safe-global/safe-contracts). 

For each deployment the address on the different networks and the abi files are available. To get an overview of the available versions check the available [json assets](./src/assets/).

To add additional deployments please follow the [deployment steps in the Safe contract repository](https://github.com/safe-global/safe-contracts#deployments).

## Install
- npm - `npm i @safe-global/safe-deployments`
- yarn - `yarn add @safe-global/safe-deployments`

## Usage

It is possible to directly use the json files in the [assets folder](./src/assets/) that contain the addresses and abi definitions.

An alternative is to use the JavaScript library methods to query the correct deployment. The library supports different methods to get the deployment of a specific contract.

Each of the method takes an optional `DeploymentFilter` as a parameter.

```ts
interface DeploymentFilter {
    version?: string,
    released?: boolean, // Defaults to true if no filter is specified
    network?: string // Chain id of the network
}
```

The method will return a `SingletonDeployment` object or `undefined` if no deployment was found for the specified filter.

```ts
interface SingletonDeployment {
    defaultAddress: string, // Address the contract was deployed to by the Safe team
    version: string,
    abi: any[],
    networkAddresses: Record<string, string>, // Address of the contract by network
    contractName: string,
    released: boolean // A released version was audited and has a running bug bounty
}
```

- Safe
```ts
const safeSingleton = getSafeSingletonDeployment()

// Returns latest contract version, even if not finally released yet
const safeSingletonNightly = getSafeSingletonDeployment({ released: undefined })

// Returns released contract version for specific network
const safeSingletonGörli = getSafeSingletonDeployment({ network: "5" })

// Returns released contract version for specific version
const safeSingleton100 = getSafeSingletonDeployment({ version: "1.0.0" })

// Version with additional events used on L2 networks
const safeL2Singleton = getSafeL2SingletonDeployment()
```

- Factories
```ts
const proxyFactory = getProxyFactoryDeployment()
```

- Libraries
```ts
const multiSendLib = getMultiSendDeployment()

const multiSendCallOnlyLib = getMultiSendCallOnlyDeployment()

const createCallLib = getCreateCallDeployment()
```

- Handler
```ts
// Returns recommended handler
const fallbackHandler = getFallbackHandlerDeployment()

const callbackHandler = getDefaultCallbackHandlerDeployment()

const compatHandler = getCompatibilityFallbackHandlerDeployment()
```
## Release cycle
`safe-deployments` release cycle is once per month, except urgent issues that require immediate attention. 

## Notes

A list of network information can be found at [chainid.network](https://chainid.network/)

## License

This library is released under MIT.
