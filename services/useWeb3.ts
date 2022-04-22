import Web3 from 'web3'

import { getWeb3 } from '@/services/web3'
import { getPrimaryWallet, useOnboardState } from '@/services/useOnboard'
import useWeb3ReadOnly from '@/services/useWeb3ReadOnly'

const useWeb3 = (): Web3 => {
  const wallets = useOnboardState('wallets')

  const web3ReadOnly = useWeb3ReadOnly()
  if (!wallets?.length) {
    return web3ReadOnly
  }

  const { label } = getPrimaryWallet(wallets)
  return getWeb3(label)
}

export default useWeb3
