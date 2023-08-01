import { useWallets, usePrivy, type ConnectedWallet, type EIP1193Provider } from '@privy-io/react-auth'
import { useMemo } from 'react'
import useAsync, { type AsyncResult } from '../useAsync'

const useWallet = (): AsyncResult<(ConnectedWallet & { provider: EIP1193Provider }) | null> => {
  const { wallets } = useWallets()
  const privy = usePrivy()

  const embeddedWallet = useMemo(
    () => wallets.find((wallet) => wallet.address === privy.user?.wallet?.address),
    [wallets, privy.user?.wallet?.address],
  )

  return useAsync(async () => {
    const provider = await embeddedWallet?.getEthereumProvider()

    if (!provider) {
      return null
    }

    return embeddedWallet
      ? { ...embeddedWallet, provider, chainId: embeddedWallet.chainId.replace('eip155:', '') }
      : null
  }, [embeddedWallet])
}

export default useWallet
