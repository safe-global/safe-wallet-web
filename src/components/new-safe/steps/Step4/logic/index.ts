import type { Web3Provider, JsonRpcProvider } from '@ethersproject/providers'
import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { getProxyFactoryContractInstance } from '@/services/contracts/safeContracts'
import type { ConnectedWallet } from '@/services/onboard'
import { BigNumber } from '@ethersproject/bignumber'
import { SafeCreationStatus } from '@/components/new-safe/steps/Step4/useSafeCreation'
import { didRevert, type EthersError } from '@/utils/ethers-utils'
import { Errors, logError } from '@/services/exceptions'
import { ErrorCode } from '@ethersproject/logger'
import { isWalletRejection } from '@/utils/wallets'
import type { PendingSafeTx } from '@/components/create-safe/types'
import type { NewSafeFormData } from '@/components/new-safe/CreateSafe'
import type { UrlObject } from 'url'
import chains from '@/config/chains'
import { AppRoutes } from '@/config/routes'
import { SAFE_APPS_EVENTS, trackEvent } from '@/services/analytics'
import type { AppDispatch, AppThunk } from '@/store'
import { showNotification } from '@/store/notificationsSlice'
import { formatError } from '@/hooks/useTxNotifications'
import { encodeSafeCreationTx } from '@/components/create-safe/logic'

/**
 * Encode a Safe creation tx in a way that we can store locally and monitor using _waitForTransaction
 */
export const getSafeCreationTxInfo = async (
  provider: Web3Provider,
  params: NewSafeFormData,
  chain: ChainInfo,
  wallet: ConnectedWallet,
): Promise<PendingSafeTx> => {
  const proxyContract = getProxyFactoryContractInstance(chain.chainId)

  const data = encodeSafeCreationTx({
    owners: params.owners.map((owner) => owner.address),
    threshold: params.threshold,
    saltNonce: params.saltNonce,
    chain,
  })

  return {
    data,
    from: wallet.address,
    nonce: await provider.getTransactionCount(wallet.address),
    to: proxyContract.getAddress(),
    value: BigNumber.from(0),
    startBlock: await provider.getBlockNumber(),
  }
}

export const handleSafeCreationError = (error: EthersError) => {
  logError(Errors._800, error.message)

  if (isWalletRejection(error)) {
    return SafeCreationStatus.WALLET_REJECTED
  }

  if (error.code === ErrorCode.TRANSACTION_REPLACED) {
    if (error.reason === 'cancelled') {
      return SafeCreationStatus.ERROR
    } else {
      return SafeCreationStatus.SUCCESS
    }
  }

  if (didRevert(error.receipt)) {
    return SafeCreationStatus.REVERTED
  }

  return SafeCreationStatus.TIMEOUT
}

export const SAFE_CREATION_ERROR_KEY = 'create-safe-error'
export const showSafeCreationError = (error: EthersError): AppThunk => {
  return (dispatch) => {
    dispatch(
      showNotification({
        message: `Your transaction was unsuccessful. Reason: ${formatError(error)}`,
        detailedMessage: error.message,
        groupKey: SAFE_CREATION_ERROR_KEY,
        variant: 'error',
      }),
    )
  }
}

export const checkSafeCreationTx = async (
  provider: JsonRpcProvider,
  pendingTx: PendingSafeTx,
  txHash: string,
  dispatch: AppDispatch,
): Promise<SafeCreationStatus> => {
  const TIMEOUT_TIME = 6.5 * 60 * 1000 // 6.5 minutes

  try {
    const receipt = await provider._waitForTransaction(txHash, 1, TIMEOUT_TIME, pendingTx)

    if (didRevert(receipt)) {
      return SafeCreationStatus.REVERTED
    }

    return SafeCreationStatus.SUCCESS
  } catch (err) {
    const _err = err as EthersError

    const status = handleSafeCreationError(_err)

    if (status !== SafeCreationStatus.SUCCESS) {
      dispatch(showSafeCreationError(_err))
    }

    return status
  }
}

export const getRedirect = (
  chainId: string,
  safeAddress: string,
  redirectQuery?: string | string[],
): UrlObject | string => {
  const redirectUrl = Array.isArray(redirectQuery) ? redirectQuery[0] : redirectQuery
  const chainPrefix = Object.keys(chains).find((prefix) => chains[prefix] === chainId)
  const address = `${chainPrefix}:${safeAddress}`

  // Should never happen in practice
  if (!chainPrefix) return AppRoutes.index

  // Go to the dashboard if no specific redirect is provided
  if (!redirectUrl) {
    return { pathname: AppRoutes.home, query: { safe: address, showCreationModal: true } }
  }

  // Otherwise, redirect to the provided URL (e.g. from a Safe App)

  // Track the redirect to Safe App
  // TODO: Narrow this down to /apps only
  if (redirectUrl.includes('apps')) {
    trackEvent(SAFE_APPS_EVENTS.SHARED_APP_OPEN_AFTER_SAFE_CREATION)
  }

  // We're prepending the safe address directly here because the `router.push` doesn't parse
  // The URL for already existing query params
  // TODO: Check if we can accomplish this with URLSearchParams or URL instead
  const hasQueryParams = redirectUrl.includes('?')
  const appendChar = hasQueryParams ? '&' : '?'
  return redirectUrl + `${appendChar}safe=${address}`
}
