interface INetworkDetails {
  [key: number]: {
    subgraphEndpoint: string
    tokenListId?: string
  }
}

export const networkDetails: INetworkDetails = {
  43113: {
    subgraphEndpoint: 'https://api.thegraph.com/subgraphs/name/nemusonaneko/llamapay-fuji',
  },
  43114: {
    subgraphEndpoint: 'https://api.thegraph.com/subgraphs/name/nemusonaneko/llamapay-avalanche-mainnet',
    tokenListId: 'avalanche',
  },
  137: {
    subgraphEndpoint: 'https://api.thegraph.com/subgraphs/name/nemusonaneko/llamapay-polygon',
    tokenListId: 'polygon-pos',
  },
  250: {
    subgraphEndpoint: 'https://api.thegraph.com/subgraphs/name/nemusonaneko/llamapay-fantom',
    tokenListId: 'fantom',
  },
  1: {
    subgraphEndpoint: 'https://api.thegraph.com/subgraphs/name/nemusonaneko/llamapay-mainnet',
    tokenListId: 'ethereum',
  },
  10: {
    subgraphEndpoint: 'https://api.thegraph.com/subgraphs/name/nemusonaneko/llamapay-optimism',
    tokenListId: 'optimistic-ethereum',
  },
  42161: {
    subgraphEndpoint: 'https://api.thegraph.com/subgraphs/name/nemusonaneko/llamapay-arbitrum',
    tokenListId: 'arbitrum-one',
  },
  56: {
    subgraphEndpoint: 'https://api.thegraph.com/subgraphs/name/nemusonaneko/llamapay-bsc',
    tokenListId: 'binance-smart-chain',
  },
  100: {
    subgraphEndpoint: 'https://api.thegraph.com/subgraphs/name/nemusonaneko/llamapay-xdai',
    tokenListId: 'xdai',
  },
  82: {
    subgraphEndpoint: 'https://graph-meter.voltswap.finance/subgraphs/name/nemusonaneko/llamapay-subgraph',
    tokenListId: 'meter',
  },
  5: {
    subgraphEndpoint: 'https://api.thegraph.com/subgraphs/name/nemusonaneko/llamapay-goerli',
  },
  1088: {
    subgraphEndpoint: 'https://andromeda-graph.metis.io/subgraphs/name/maia-dao/llama-pay',
    tokenListId: 'metis-andromeda',
  },
  2222: {
    subgraphEndpoint: 'https://the-graph.kava.io/subgraphs/name/nemusonaneko/llamapay-subgraph/',
    tokenListId: 'kava-evm',
  },
}
