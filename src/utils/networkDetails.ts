interface INetworkDetails {
  [key: number]: {
    subgraphEndpoint: string
  }
}

export const networkDetails: INetworkDetails = {
  43113: {
    subgraphEndpoint: 'https://api.thegraph.com/subgraphs/name/nemusonaneko/llamapay-fuji',
  },
  43114: {
    subgraphEndpoint: 'https://api.thegraph.com/subgraphs/name/nemusonaneko/llamapay-avalanche-mainnet',
  },
  137: {
    subgraphEndpoint: 'https://api.thegraph.com/subgraphs/name/nemusonaneko/llamapay-polygon',
  },
  250: {
    subgraphEndpoint: 'https://api.thegraph.com/subgraphs/name/nemusonaneko/llamapay-fantom',
  },
  1: {
    subgraphEndpoint: 'https://api.thegraph.com/subgraphs/name/nemusonaneko/llamapay-mainnet',
  },
  10: {
    subgraphEndpoint: 'https://api.thegraph.com/subgraphs/name/nemusonaneko/llamapay-optimism',
  },
  42161: {
    subgraphEndpoint: 'https://api.thegraph.com/subgraphs/name/nemusonaneko/llamapay-arbitrum',
  },
  56: {
    subgraphEndpoint: 'https://api.thegraph.com/subgraphs/name/nemusonaneko/llamapay-bsc',
  },
  5: {
    subgraphEndpoint: 'https://api.thegraph.com/subgraphs/name/nemusonaneko/llamapay-goerli',
  },
  1088: {
    subgraphEndpoint: 'https://andromeda-graph.metis.io/subgraphs/name/maia-dao/llama-pay',
  },
  2222: {
    subgraphEndpoint: 'https://the-graph.kava.io/subgraphs/name/nemusonaneko/llamapay-subgraph/',
  },
}
