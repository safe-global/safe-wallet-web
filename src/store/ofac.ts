import type { BaseQueryFn } from '@reduxjs/toolkit/query/react'
import { createApi } from '@reduxjs/toolkit/query/react'
import { selectChainById } from '@/store/chainsSlice'
import { Contract } from 'ethers'
import { createWeb3ReadOnly } from '@/hooks/wallets/web3'
import type { RootState } from '.'
import { CHAINALYSIS_OFAC_CONTRACT } from '@/config/constants'

// Chainalysis contract ABI and address
const contractAbi = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
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
]

const customBaseQuery: BaseQueryFn<string | null, unknown> = async (address, api) => {
  const { getState } = api
  const state = getState()
  const chain = selectChainById(state as RootState, '1')

  if (!chain || !address) return { error: { status: 'CUSTOM_ERROR', data: 'Chain or address is undefined' } }

  const provider = createWeb3ReadOnly(chain)
  const contract = new Contract(CHAINALYSIS_OFAC_CONTRACT, contractAbi, provider)

  try {
    const isAddressBlocked: boolean = await contract['isSanctioned'](address)
    return { data: isAddressBlocked }
  } catch (error) {
    return { error: { status: 'CUSTOM_ERROR', data: (error as Error).message } }
  }
}

export const ofacApi = createApi({
  reducerPath: 'ofacApi',
  baseQuery: customBaseQuery,
  endpoints: (builder) => ({
    getIsSanctioned: builder.query({
      query: (address: string) => address,
    }),
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetIsSanctionedQuery } = ofacApi
