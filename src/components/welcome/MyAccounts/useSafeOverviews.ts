import { useTokenListSetting } from '@/hooks/loadables/useLoadBalances'
import useAsync from '@/hooks/useAsync'
import useWallet from '@/hooks/wallets/useWallet'
import { useAppSelector } from '@/store'
import { selectCurrency } from '@/store/settingsSlice'
import { getSafeOverviews } from '@safe-global/safe-gateway-typescript-sdk'

function useSafeOverviews(safes: Array<{ address: string; chainId: string }>) {
  const excludeSpam = useTokenListSetting() || false
  const currency = useAppSelector(selectCurrency)
  const wallet = useWallet()
  const walletAddress = wallet?.address

  return useAsync(async () => {
    const safesStrings = safes.map((safe) => `${safe.chainId}:${safe.address}` as `${number}:0x${string}`)

    return await getSafeOverviews(safesStrings, {
      trusted: true,
      exclude_spam: excludeSpam,
      currency,
      wallet_address: walletAddress,
    })
  }, [safes, excludeSpam, currency, walletAddress])
}

export default useSafeOverviews
