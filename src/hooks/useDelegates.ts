import useSafeInfo from '@/hooks/useSafeInfo'
import useWallet from '@/hooks/wallets/useWallet'
import { useGetDelegatesQuery } from '@/store/gateway'
import { skipToken } from '@reduxjs/toolkit/query/react'

const useDelegates = () => {
  const {
    safe: { chainId },
    safeAddress,
  } = useSafeInfo()

  return useGetDelegatesQuery(chainId && safeAddress ? { chainId, safeAddress } : skipToken)
}

export const useIsWalletDelegate = () => {
  const wallet = useWallet()
  const delegates = useDelegates()

  return delegates.data?.results.some((delegate) => delegate.delegate === wallet?.address)
}

export default useDelegates
