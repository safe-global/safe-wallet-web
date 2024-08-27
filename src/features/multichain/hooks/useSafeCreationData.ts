import useAsync, { type AsyncResult } from '@/hooks/useAsync'
import { createWeb3ReadOnly } from '@/hooks/wallets/web3'
import { type UndeployedSafe, selectRpc, selectUndeployedSafe, type ReplayedSafeProps } from '@/store/slices'
import { Safe_proxy_factory__factory } from '@/types/contracts'
import { sameAddress } from '@/utils/addresses'
import { getCreationTransaction } from 'safe-client-gateway-sdk'
import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { useAppSelector } from '@/store'
import { isPredictedSafeProps } from '@/features/counterfactual/utils'
import { ECOSYSTEM_ID_ADDRESS } from '@/config/constants'
import {
  getReadOnlyGnosisSafeContract,
  getReadOnlyProxyFactoryContract,
  getReadOnlyFallbackHandlerContract,
} from '@/services/contracts/safeContracts'
import { getLatestSafeVersion } from '@/utils/chains'
import { ZERO_ADDRESS, EMPTY_DATA } from '@safe-global/protocol-kit/dist/src/utils/constants'

const getUndeployedSafeCreationData = async (
  undeployedSafe: UndeployedSafe,
  chain: ChainInfo,
): Promise<ReplayedSafeProps> => {
  if (isPredictedSafeProps(undeployedSafe.props)) {
    // Copy predicted safe
    // Encode Safe creation and determine the addresses the Safe creation would use
    const { owners, threshold } = undeployedSafe.props.safeAccountConfig
    const usedSafeVersion = undeployedSafe.props.safeDeploymentConfig?.safeVersion ?? getLatestSafeVersion(chain)
    const readOnlySafeContract = await getReadOnlyGnosisSafeContract(chain, usedSafeVersion)
    const readOnlyProxyFactoryContract = await getReadOnlyProxyFactoryContract(usedSafeVersion)
    const readOnlyFallbackHandlerContract = await getReadOnlyFallbackHandlerContract(usedSafeVersion)

    const callData = {
      owners,
      threshold,
      to: ZERO_ADDRESS,
      data: EMPTY_DATA,
      fallbackHandler: await readOnlyFallbackHandlerContract.getAddress(),
      paymentToken: ZERO_ADDRESS,
      payment: 0,
      paymentReceiver: ECOSYSTEM_ID_ADDRESS,
    }

    // @ts-ignore union type is too complex
    const setupData = readOnlySafeContract.encode('setup', [
      callData.owners,
      callData.threshold,
      callData.to,
      callData.data,
      callData.fallbackHandler,
      callData.paymentToken,
      callData.payment,
      callData.paymentReceiver,
    ])

    return {
      factoryAddress: await readOnlyProxyFactoryContract.getAddress(),
      masterCopy: await readOnlySafeContract.getAddress(),
      saltNonce: undeployedSafe.props.safeDeploymentConfig?.saltNonce ?? '0',
      setupData,
    }
  }

  // We already have a replayed Safe. In this case we can return the identical data
  return undeployedSafe.props
}

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

  const undeployedSafe = useAppSelector((selector) =>
    selectUndeployedSafe(selector, chain?.chainId ?? '1', safeAddress),
  )

  return useAsync<ReplayedSafeProps | undefined>(async () => {
    if (!chain) {
      return undefined
    }

    // 1. The safe is counterfactual
    if (undeployedSafe) {
      return getUndeployedSafeCreationData(undeployedSafe, chain)
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
  }, [chain, customRpc, safeAddress, undeployedSafe])
}
