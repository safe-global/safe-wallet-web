## Data Import / Export

Currently we only support the importing of data from our old web interface (safe-react) to the new one (web-core).

### How does the export work?

In the old interface navigate to `Settings -> Details -> Download your data`. This button will download a `.json` file which contains the **entire localStorage**.
The export files have this format:

```json
{
    "version": "1.0",
    "data": {
        <entire localStorage here>
    }
}
```

### How does the import work?

In the new interface navigate to `/import` or `Settings -> Data` and open the _Import all data_ modal.

This will only import specific data:

- The added Safes
- The (valid\*) address book entries

* Only named, checksummed address book entries will be added.

#### Address book

All address book entries are stored under the key `SAFE__addressBook`.
This entry contains a stringified address book with the following format:

```ts
{
  address: string
  name: string
  chainId: string
}
;[]
```

Example:

```json
{
  "version": "1.0",
  "data": {
    "SAFE__addressBook": "[{\"address\":\"0xB5E64e857bb7b5350196C5BAc8d639ceC1072745\",\"name\":\"Testname\",\"chainId\":\"5\"},{\"address\":\"0x08f6466dD7891ac9A60C769c7521b0CF2F60c153\",\"name\":\"authentic-goerli-safe\",\"chainId\":\"5\"}]"
  }
}
```

#### Added safes

Added safes are stored under one entry per chain.
Each entry has a key in following format: `_immortal|v2_<chainPrefix>__SAFES`
The chain prefix is either the chain ID or prefix, as follows:

```
  '1': 'MAINNET',
  '56': 'BSC',
  '100': 'XDAI',
  '137': 'POLYGON',
  '246': 'ENERGY_WEB_CHAIN',
  '42161': 'ARBITRUM',
  '73799': 'VOLTA',
```

Examples:

- `_immortal|v2_MAINNET__SAFES` for mainnet
- `_immortal|v2_5__SAFES` for goerli (chainId 5)

Inside each of these keys the full Safe information (including balances) is stored in stringified format.
Example:

```json
{
  "version": "1.0",
  "data": {
    "_immortal|v2_5__SAFES": "{\"0xAecDFD3A19f777F0c03e6bf99AAfB59937d6467b\":{\"address\":\"0xAecDFD3A19f777F0c03e6bf99AAfB59937d6467b\",\"chainId\":\"5\",\"threshold\":2,\"ethBalance\":\"0.3\",\"totalFiatBalance\":\"435.08\",\"owners\":[\"0x3819b800c67Be64029C1393c8b2e0d0d627dADE2\",\"0x954cD69f0E902439f99156e3eeDA080752c08401\",\"0xB5E64e857bb7b5350196C5BAc8d639ceC1072745\"],\"modules\":[],\"spendingLimits\":[],\"balances\":[{\"tokenAddress\":\"0x0000000000000000000000000000000000000000\",\"fiatBalance\":\"435.08100\",\"tokenBalance\":\"0.3\"},{\"tokenAddress\":\"0x61fD3b6d656F39395e32f46E2050953376c3f5Ff\",\"fiatBalance\":\"0.00000\",\"tokenBalance\":\"22405.086233211233211233\"}],\"implementation\":{\"value\":\"0x3E5c63644E683549055b9Be8653de26E0B4CD36E\"},\"loaded\":true,\"nonce\":1,\"currentVersion\":\"1.3.0+L2\",\"needsUpdate\":false,\"featuresEnabled\":[\"CONTRACT_INTERACTION\",\"DOMAIN_LOOKUP\",\"EIP1559\",\"ERC721\",\"SAFE_APPS\",\"SAFE_TX_GAS_OPTIONAL\",\"SPENDING_LIMIT\",\"TX_SIMULATION\",\"WARNING_BANNER\"],\"loadedViaUrl\":false,\"guard\":\"\",\"collectiblesTag\":\"1667921524\",\"txQueuedTag\":\"1667921524\",\"txHistoryTag\":\"1667400927\"}}"
  }
}
```

### Noteworthy

- Only address book entries with names and checksummed addresses will be imported.
- Rinkeby data will be ignored as it's not supported anymore.
