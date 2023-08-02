import { type ExternalProvider, Web3Provider } from '@ethersproject/providers'
import useAsync from '../useAsync'
import useWeb3AuthStore from './useWeb3Auth'

export type ConnectedWallet = {
  address: string
  chainId: string
  label: string
  provider: ExternalProvider
  ens: string | undefined
}

const useWallet = () => {
  const web3Auth = useWeb3AuthStore()
  return useAsync(async () => {
    if (!web3Auth || !web3Auth.connected || !web3Auth.provider) {
      return Promise.resolve(null)
    }
    const userInfo = await web3Auth.getUserInfo()
    const web3Provider = new Web3Provider(web3Auth.provider)
    const address = await web3Provider.getSigner().getAddress()
    const chainId = await web3Provider.getNetwork()

    return {
      address,
      chainId: chainId.chainId.toString(),
      label: 'Web3Auth',
      provider: web3Auth.provider as ExternalProvider,
      ens: userInfo.name,
    }
  }, [web3Auth, web3Auth?.connected, web3Auth?.provider])
}

export default useWallet
