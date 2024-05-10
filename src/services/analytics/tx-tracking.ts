import { TX_TYPES } from '@/services/analytics/events/transactions'
import type { GADimensions } from '@/services/analytics/types'
import { getTxDetails } from '@/services/transactions'
import { isWalletConnectSafeApp } from '@/utils/gateway'
import { SettingsInfoType, type TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import {
  isERC721Transfer,
  isMultiSendTxInfo,
  isSettingsChangeTxInfo,
  isTransferTxInfo,
  isCustomTxInfo,
  isCancellationTxInfo,
  isSwapTxInfo,
} from '@/utils/transaction-guards'

type TrackingParams = {
  type: string
} & Partial<GADimensions>

export const getTransactionTrackingParams = async (chainId: string, txId: string): Promise<TrackingParams> => {
  let details: TransactionDetails

  try {
    details = await getTxDetails(chainId, txId)
  } catch {
    return {
      type: TX_TYPES.custom,
    }
  }

  const type = getTransactionTrackingType(details)

  return {
    type,
    transaction_id: isSwapTxInfo(details.txInfo) ? details.txInfo.uid : undefined,
  }
}

export const getTransactionTrackingType = (details: TransactionDetails): string => {
  const { txInfo } = details

  if (isTransferTxInfo(txInfo)) {
    if (isERC721Transfer(txInfo.transferInfo)) {
      return TX_TYPES.transfer_nft
    }
    return TX_TYPES.transfer_token
  }

  if (isSwapTxInfo(txInfo)) {
    return TX_TYPES.native_swap
  }

  if (isSettingsChangeTxInfo(txInfo)) {
    switch (txInfo.settingsInfo?.type) {
      case SettingsInfoType.ADD_OWNER: {
        return TX_TYPES.owner_add
      }
      case SettingsInfoType.REMOVE_OWNER: {
        return TX_TYPES.owner_remove
      }
      case SettingsInfoType.SWAP_OWNER: {
        return TX_TYPES.owner_swap
      }
      case SettingsInfoType.CHANGE_THRESHOLD: {
        return TX_TYPES.owner_threshold_change
      }
      case SettingsInfoType.DISABLE_MODULE: {
        return TX_TYPES.module_remove
      }
      case SettingsInfoType.DELETE_GUARD: {
        return TX_TYPES.guard_remove
      }
    }
  }

  if (isCustomTxInfo(txInfo)) {
    if (isCancellationTxInfo(txInfo)) {
      return TX_TYPES.rejection
    }

    if (details.safeAppInfo) {
      return isWalletConnectSafeApp(details.safeAppInfo.url) ? TX_TYPES.walletconnect : details.safeAppInfo.url
    }

    if (isMultiSendTxInfo(txInfo)) {
      return TX_TYPES.batch
    }
  }

  return TX_TYPES.custom
}
