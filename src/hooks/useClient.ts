import { type EVMProvider } from '@particle-network/connectors'
import { createPublicClient, createWalletClient, custom, http, type PublicClient, type WalletClient } from 'viem'
import { create } from 'zustand'

type State = {
  publicClient: PublicClient
  walletClient?: WalletClient
}

type Actions = {
  setProvider: (provider: EVMProvider) => void
  setPublicClient: (chainId: number) => void
}

export const getRpcUrl = (chainId: number) => {
  return `${process.env.NEXT_PUBLIC_RPC_URL}/evm-chain?chainId=${chainId}&projectUuid=${process.env.NEXT_PUBLIC_PROJECT_ID}&projectKey=${process.env.NEXT_PUBLIC_CLIENT_KEY}`
}

const getPublicClient = (chainId: number) => {
  const rpc = getRpcUrl(chainId)
  console.log('publicClient Rpc', rpc)

  const publicClient = createPublicClient({
    transport: http(rpc),
  })
  return publicClient
}

const useClient = create<State & Actions>((set) => ({
  publicClient: getPublicClient(1),
  setPublicClient: (chainId: number) => {
    const publicClient = getPublicClient(chainId)
    set({ publicClient })
  },
  setProvider: (provider: EVMProvider) => {
    if (provider) {
      const walletClient = createWalletClient({
        transport: custom(provider),
      })
      set((state) => ({ walletClient, publicClient: state.publicClient }))
    } else {
      set((state) => ({ walletClient: undefined, publicClient: state.publicClient }))
    }
  },
}))

export default useClient
