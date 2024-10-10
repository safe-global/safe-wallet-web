import useWallet from '@/hooks/wallets/useWallet'
import useChainId from './useChainId'
import { useGetOwnedSafesQuery } from '@/store/gateway'
import { skipToken } from '@reduxjs/toolkit/query'

const useOwnedSafes = (): string[] => {
  const chainId = useChainId()
  const { address } = useWallet() || {}

  const { data: ownedSafes } = useGetOwnedSafesQuery(address ? { chainId, address } : skipToken)

  return ownedSafes?.safes ?? []
}

export default useOwnedSafes
