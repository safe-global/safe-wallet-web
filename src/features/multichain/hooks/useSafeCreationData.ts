import useAsync, { type AsyncResult } from '@/hooks/useAsync'
import { createWeb3ReadOnly } from '@/hooks/wallets/web3'
import { selectRpc, type ReplayedSafeProps } from '@/store/slices'
import { Safe_proxy_factory__factory } from '@/types/contracts'
import { sameAddress } from '@/utils/addresses'
import { getCreationTransaction } from 'safe-client-gateway-sdk'
import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { useAppSelector } from '@/store'

const proxyFactoryInterface = Safe_proxy_factory__factory.createInterface()
const createProxySelector = proxyFactoryInterface.getFunction('createProxyWithNonce').selector
/**
 * Fetches the data with which the given Safe was originally created.
 * Useful to replay a Safe creation.
 */
export const useSafeCreationData = (
  safeAddress: string,
  chain: ChainInfo | undefined,
): AsyncResult<ReplayedSafeProps> => {
  const customRpc = useAppSelector(selectRpc)

  return useAsync<ReplayedSafeProps | undefined>(async () => {
    if (!chain) {
      return undefined
    }

    // We need to create a readOnly provider of the deployed chain
    const customRpcUrl = chain ? customRpc?.[chain.chainId] : undefined
    const provider = createWeb3ReadOnly(chain, customRpcUrl)

    const { data: creation } = await getCreationTransaction({
      path: {
        chainId: chain.chainId,
        safeAddress,
      },
    })

    if (!creation || !provider || !creation.masterCopy || !creation.setupData) {
      return undefined
    }

    // TODO: Fetch saltNonce by fetching the transaction from the RPC.
    const tx = await provider?.getTransaction(creation.transactionHash)

    const txData = tx?.data
    const startOfTx = txData?.indexOf(createProxySelector.slice(2, 10))
    if (!txData || !startOfTx) {
      return undefined
    }

    // decode tx
    try {
      const [masterCopy, initializer, saltNonce] = proxyFactoryInterface.decodeFunctionData(
        'createProxyWithNonce',
        `0x${txData.slice(startOfTx)}`,
      )

      const txMatches =
        sameAddress(masterCopy, creation.masterCopy ?? undefined) &&
        (initializer as string)?.toLowerCase().includes(creation.setupData?.toLowerCase())

      if (!txMatches || typeof saltNonce !== 'bigint') {
        // We found the wrong tx. This tx seems to deploy multiple Safes at once.
        // TODO: Check each possible match
        return undefined
      }

      // Check that it is the correct deployment
      return {
        factoryAddress: creation.factoryAddress,
        masterCopy: creation.masterCopy,
        setupData: creation.setupData,
        saltNonce: saltNonce.toString(),
      }
    } catch (err) {
      console.error(err)
      throw err
    }
  }, [chain, customRpc, safeAddress])
}
