import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers'
import { useEffect, useState } from 'react'
import {
  createWeb3,
  createWeb3ReadOnly,
  getWeb3,
  getWeb3ReadOnly,
  setWeb3,
  setWeb3ReadOnly,
} from '@/services/wallets/web3'
import { useCurrentChain } from '@/services/useChains'
import useWallet from './useWallet'

export const useWeb3ReadOnly = (): JsonRpcProvider => {
  const chain = useCurrentChain()
  const wallet = useWallet()
  const [web3ReadOnlyProvider, setWeb3ReadOnlyProvider] = useState<JsonRpcProvider>(getWeb3ReadOnly())

  useEffect(() => {
    if (!chain || !wallet || chain.chainId !== wallet.chainId) {
      return
    }
    const web3ReadOnly = createWeb3ReadOnly(chain)
    setWeb3ReadOnlyProvider(web3ReadOnly)
  }, [chain, wallet])

  return web3ReadOnlyProvider
}

export const useWeb3 = (): Web3Provider => {
  const chain = useCurrentChain()
  const wallet = useWallet()
  const [web3Provider, setWeb3Provider] = useState<Web3Provider>(getWeb3())

  useEffect(() => {
    if (!chain || !wallet || chain.chainId !== wallet.chainId) {
      return
    }
    const web3 = createWeb3(wallet.provider)
    setWeb3Provider(web3)
  }, [chain, wallet])

  return web3Provider
}

export const useInitWeb3 = (): void => {
  const web3 = useWeb3()
  const web3ReadOnly = useWeb3ReadOnly()

  useEffect(() => {
    setWeb3(web3)
  }, [web3])

  useEffect(() => {
    setWeb3ReadOnly(web3ReadOnly)
  }, [web3ReadOnly])
}
