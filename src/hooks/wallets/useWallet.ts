import { useWallets, type ConnectedWallet, type EIP1193Provider, usePrivy } from '@privy-io/react-auth'
import { useMemo } from 'react'
import useAsync, { type AsyncResult } from '../useAsync'

const useWallet = (): AsyncResult<(ConnectedWallet & { provider: EIP1193Provider }) | null> => {
  const { wallets } = useWallets()
  const privy = usePrivy()

  console.log('useWallet', wallets, privy)

  const embeddedWallet = useMemo(() => wallets.find((wallet) => wallet.linked), [wallets])

  return useAsync(async () => {
    const provider = await embeddedWallet?.getEthereumProvider()

    if (!provider) {
      return null
    }

    const chainId = await provider.request({ method: 'eth_chainId' })
    console.log('eth_chainId', chainId)

    return embeddedWallet
      ? { ...embeddedWallet, provider, chainId: chainId ?? embeddedWallet.chainId.replace('eip155:', '') }
      : null
  }, [embeddedWallet])
}

export default useWallet
