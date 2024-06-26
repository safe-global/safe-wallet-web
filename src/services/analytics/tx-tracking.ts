import { TX_TYPES } from '@/services/analytics/events/transactions'
import { getTxDetails } from '@/services/transactions'
import { SettingsInfoType, type TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import {
  isERC721Transfer,
  isMultiSendTxInfo,
  isSettingsChangeTxInfo,
  isTransferTxInfo,
  isCustomTxInfo,
  isCancellationTxInfo,
  isSwapOrderTxInfo,
} from '@/utils/transaction-guards'

export const getTransactionTrackingType = async (chainId: string, txId: string): Promise<string> => {
  let details: TransactionDetails

  try {
    details = await getTxDetails(chainId, txId)
  } catch {
    return TX_TYPES.custom
  }

  const { txInfo } = details

  if (isTransferTxInfo(txInfo)) {
    if (isERC721Transfer(txInfo.transferInfo)) {
      return TX_TYPES.transfer_nft
    }
    return TX_TYPES.transfer_token
  }

  if (isSwapOrderTxInfo(txInfo)) {
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
      return details.safeAppInfo.url
    }

    if (isMultiSendTxInfo(txInfo)) {
      return TX_TYPES.batch
    }

    return TX_TYPES.walletconnect
  }

  return TX_TYPES.custom
}
