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
  const [web3ReadOnlyState, setWeb3ReadOnlyState] = useState<JsonRpcProvider>(getWeb3ReadOnly())

  useEffect(() => {
    if (!chain || !wallet || chain.chainId !== wallet.chainId) {
      return
    }
    const web3ReadOnly = createWeb3ReadOnly(chain)
    setWeb3ReadOnlyState(web3ReadOnly)
  }, [chain])

  return web3ReadOnlyState
}

export const useWeb3 = (): Web3Provider => {
  const chain = useCurrentChain()
  const wallet = useWallet()
  const [web3State, setWeb3State] = useState<Web3Provider>(getWeb3())

  useEffect(() => {
    if (!chain || !wallet || chain.chainId !== wallet.chainId) {
      return
    }
    const web3 = createWeb3(wallet.provider)
    setWeb3State(web3)
  }, [chain, wallet])

  return web3State
}

export const useInitWeb3 = (): JsonRpcProvider => {
  const web3 = useWeb3()
  const web3ReadOnly = useWeb3ReadOnly()

  useEffect(() => {
    setWeb3(web3)
  }, [web3])

  useEffect(() => {
    setWeb3ReadOnly(web3ReadOnly)
  }, [web3ReadOnly])

  return web3ReadOnly
}
