import { useEffect } from 'react'

import { setWeb3 } from '@/hooks/wallets/web3'
import { useProvider } from './useProvider'

export const useInitWeb3 = () => {
  const _provider = useProvider()

  useEffect(() => {
    if (_provider) {
      setWeb3(_provider)
    }
  }, [_provider])
}
