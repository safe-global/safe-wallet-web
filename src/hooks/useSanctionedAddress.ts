import { useGetIsSanctionedQuery } from '@/store/ofac'
import useSafeAddress from './useSafeAddress'
import useWallet from './wallets/useWallet'
import { skipToken } from '@reduxjs/toolkit/query/react'

export const useSanctionedAddress = () => {
  const wallet = useWallet()
  const safeAddress = useSafeAddress()

  const { data: isWalletSanctioned } = useGetIsSanctionedQuery(wallet ? wallet.address : skipToken)

  const { data: isSafeSanctioned } = useGetIsSanctionedQuery(safeAddress !== '' ? safeAddress : skipToken)

  if (isSafeSanctioned) {
    return safeAddress
  }
  if (isWalletSanctioned) {
    return wallet?.address
  }

  return undefined
}
