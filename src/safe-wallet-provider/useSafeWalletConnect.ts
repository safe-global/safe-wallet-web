import { useEffect } from 'react'
import useSafeWalletProvider from './useSafeWalletProvider'

const useSafeWalletConnect = () => {
  const safeWalletProvider = useSafeWalletProvider()

  useEffect(() => {
    if (!safeWalletProvider) return

    const handler = async (e: MessageEvent) => {
      if (e.origin === location.origin) return

      if (e.data.safeRpcRequest) {
        const response = await safeWalletProvider.request(e.data.safeRpcRequest)

        window.opener?.postMessage(
          {
            safeRpcResponse: response,
          },
          e.origin,
        )
      }
    }

    window.addEventListener('message', handler)

    window.opener?.postMessage('safeWalletLoaded', '*')

    return () => {
      window.removeEventListener('message', handler)
    }
  }, [safeWalletProvider])
}

export default useSafeWalletConnect
