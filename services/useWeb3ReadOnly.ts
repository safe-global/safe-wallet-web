import Web3 from 'web3'

import useSafeAddress from '@/services/useSafeAddress'
import { getWeb3ReadOnly } from '@/services/web3'

const useWeb3ReadOnly = (): Web3 => {
  const { chainId } = useSafeAddress()
  return getWeb3ReadOnly(chainId)
}

export default useWeb3ReadOnly
