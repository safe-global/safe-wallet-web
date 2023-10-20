import { useCallback } from 'react'
import { useWalletConnectClipboardUri } from '@/services/walletconnect/useWalletConnectClipboardUri'
import { useWalletConnectSearchParamUri } from '@/services/walletconnect/useWalletConnectSearchParamUri'

const useWcUri = (): [string, () => void] => {
  const [searchParamWcUri, setSearchParamWcUri] = useWalletConnectSearchParamUri()
  const [clipboardWcUri, setClipboardWcUri] = useWalletConnectClipboardUri()
  const uri = searchParamWcUri || clipboardWcUri || ''

  const clearUri = useCallback(() => {
    setSearchParamWcUri(null)
    // This does not clear the system clipboard, just state
    setClipboardWcUri('')
  }, [setClipboardWcUri, setSearchParamWcUri])

  return [uri, clearUri]
}

export default useWcUri
