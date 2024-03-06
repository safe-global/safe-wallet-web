import { getViemChain } from '@/utils/chainUtils'
import { useCallback } from 'react'
import useClient from './useClient'

const useSwitchChain = () => {
  const walletClient = useClient((state) => state.walletClient)

  const switchChain = useCallback(
    async (chainId: number) => {
      if (!walletClient) {
        throw new Error('Please connect wallet first!')
      }
      const currentChainId = await walletClient.getChainId()
      if (currentChainId === chainId) {
        return
      }
      try {
        await walletClient.switchChain({
          id: chainId,
        })
      } catch (error: any) {
        if (
          error.code === 4902 ||
          ((error.code === -32000 || error.code === -32603) &&
            error.message &&
            error.message.startsWith('Unrecognized chain ID'))
        ) {
          await walletClient.addChain({
            chain: getViemChain(chainId),
          })
        } else {
          throw error
        }
      }
    },
    [walletClient],
  )

  return { switchChain }
}

export default useSwitchChain
