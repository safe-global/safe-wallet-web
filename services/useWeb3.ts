import { useEffect } from 'react'
import { setWeb3 } from '@/services/web3'
import Web3 from 'web3'
import { useAppSelector } from 'store'
import useSafeAddress from '@/services/useSafeAddress'
import { selectChainById } from '@/store/chainsSlice'

export const useWeb3 = () => {
  const { chainId } = useSafeAddress()
  const chainConfig = useAppSelector((state) => selectChainById(state, chainId))

  useEffect(() => {
    if (!chainConfig) return

    // TODO: Replace with provider from onboard
    const provider = Web3.givenProvider
    setWeb3(provider)
  }, [chainConfig])
}
