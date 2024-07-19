import { BaseQueryFn, createApi, FetchArgs, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { selectChainById } from '@/store/chainsSlice'
import { Contract, JsonRpcProvider } from 'ethers'
import { createWeb3ReadOnly } from '@/hooks/wallets/web3'
// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// ABI and contract address
const contractAbi = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'addr',
        type: 'address',
      },
    ],
    name: 'NonSanctionedAddress',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'addr',
        type: 'address',
      },
    ],
    name: 'SanctionedAddress',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address[]',
        name: 'addrs',
        type: 'address[]',
      },
    ],
    name: 'SanctionedAddressesAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address[]',
        name: 'addrs',
        type: 'address[]',
      },
    ],
    name: 'SanctionedAddressesRemoved',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: 'newSanctions',
        type: 'address[]',
      },
    ],
    name: 'addToSanctionsList',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'addr',
        type: 'address',
      },
    ],
    name: 'isSanctioned',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'addr',
        type: 'address',
      },
    ],
    name: 'isSanctionedVerbose',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: 'removeSanctions',
        type: 'address[]',
      },
    ],
    name: 'removeFromSanctionsList',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

const contractAddress = '0x40c57923924b5c5c5455c48d93317139addac8fb'

const customBaseQuery: BaseQueryFn<{ method: string; args: any[] }, unknown, FetchBaseQueryError> = async (
  { method, args },
  api,
  extraOptions,
) => {
  const { getState } = api
  const state = getState()
  const chain = selectChainById(state, "1")

  console.log('state', state, chain)
  // Initialize the JsonRpcProvider
  const provider = createWeb3ReadOnly(chain)
  // const provider = new JsonRpcProvider('https://mainnet.infura.io/v3/9a7c22a2b3134b5b910b556bb32a6c82')
  const contract = new Contract(contractAddress, contractAbi, provider)

  try {
    const response = await contract[method](...args)
    return { data: response }
  } catch (error) {
    return { error: { status: 'CUSTOM_ERROR', data: error.message } }
  }
}

// const customBaseQuery = async (args, api, extraOptions) => {
//   const { getState } = api;
//   const state = getState();
//   const chain = selectChainById(state, 1);
//   console.log(chain);
//
//   // Use state to modify the query args or options
//   return fetchBaseQuery(args)(api, extraOptions);
// };

// const Web3 = require('web3')
// const rpcurl = "<your web3 provider>"
// const web3 = new Web3(rpcurl)
// const abi = [/* See our ABI below */]
// const contract_address = "0x40c57923924b5c5c5455c48d93317139addac8fb"
// contract = new web3.eth.Contract(abi, contract_address)
// contract.methods.isSanctioned("0x7f268357A8c2552623316e2562D90e642bB538E5").call((err, result) => { console.log("Non-sanctioned address: "); console.log(result); });
// contract.methods.isSanctioned("0x7F367cC41522cE07553e823bf3be79A889DEbe1B").call((err, result) => { console.log("Sanctioned address: "); console.log(result); });
// Define a service using a base URL and expected endpoints
export const ofacApi = createApi({
  reducerPath: 'ofacApi',
  baseQuery: customBaseQuery,
  endpoints: (builder) => ({
    getContractData: builder.query({
      query: ({ method, args }) => ({ method, args }),
    }),
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetContractDataQuery } = ofacApi
