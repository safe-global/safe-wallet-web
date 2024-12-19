import { useGetIsSanctionedQuery } from '@/store/api/ofac'
import useSafeAddress from './useSafeAddress'
import useWallet from './wallets/useWallet'
import { skipToken } from '@reduxjs/toolkit/query/react'

/**
 * Checks if the opened Safe or the connected wallet are sanctioned and returns the sanctioned address.
 * @param isRestricted the check is only performed if isRestricted is true.
 * @returns address of sanctioned wallet or Safe
 */
export const useSanctionedAddress = (isRestricted = true) => {
  const wallet = useWallet()
  const safeAddress = useSafeAddress()

  const { data: isWalletSanctioned } = useGetIsSanctionedQuery(isRestricted && wallet ? wallet.address : skipToken)

  const { data: isSafeSanctioned } = useGetIsSanctionedQuery(
    isRestricted && safeAddress !== '' ? safeAddress : skipToken,
  )

  if (isSafeSanctioned) {
    return safeAddress
  }
  if (isWalletSanctioned) {
    return wallet?.address
  }

  return undefined
}
