import { PIMLICO_API_KEY } from '@/config/constants'
import useAsync from '@/hooks/useAsync'
import useChainId from '@/hooks/useChainId'
import { useCurrentChain } from '@/hooks/useChains'
import useSafeAddress from '@/hooks/useSafeAddress'
import useWallet from '@/hooks/wallets/useWallet'
import { useAppSelector } from '@/store'
import { Safe4337Pack } from '@safe-global/relay-kit'
import { selectUndeployedSafe } from '../store/undeployedSafesSlice'

export const useSafe4337Pack = () => {
  const wallet = useWallet()
  const chainInfo = useCurrentChain()
  const chainId = useChainId()
  const safeAddress = useSafeAddress()
  const undeployedSafe = useAppSelector((state) => selectUndeployedSafe(state, chainId, safeAddress))

  return useAsync<Safe4337Pack | undefined>(() => {
    if (!wallet || !chainInfo) return

    console.log(`Initializing 4337 pack for ${undeployedSafe ? 'undeployed' : 'existing'} Safe`)

    return Safe4337Pack.init({
      provider: wallet.provider,
      rpcUrl: chainInfo.publicRpcUri.value,
      bundlerUrl: `https://api.pimlico.io/v1/sepolia/rpc?apikey=${PIMLICO_API_KEY}`,
      options: undeployedSafe
        ? {
            owners: undeployedSafe.props.safeAccountConfig.owners,
            threshold: undeployedSafe.props.safeAccountConfig.threshold,
            safeVersion: undeployedSafe.props.safeDeploymentConfig?.safeVersion,
            saltNonce: undeployedSafe.props.safeDeploymentConfig?.saltNonce,
          }
        : {
            safeAddress,
          },
    })
  }, [chainInfo, safeAddress, undeployedSafe, wallet])
}
