import { TX_TYPES } from '@/services/analytics/events/transactions'
import { getTxDetails } from '@/services/tx/txDetails'
import { isWalletConnectSafeApp } from '@/services/walletconnect/utils'
import { SettingsInfoType, type TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import {
  isERC721Transfer,
  isMultiSendTxInfo,
  isSettingsChangeTxInfo,
  isTransferTxInfo,
  isCustomTxInfo,
} from './transaction-guards'
import { isRejectionTx } from './transactions'

export const getTransactionTrackingType = async (txId: string, chainId: string): Promise<string | undefined> => {
  let details: TransactionDetails
  try {
    details = await getTxDetails(txId, chainId)
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

  if (isRejectionTx({ data: details.txData?.hexData || '', value: details.txData?.value || '' })) {
    return TX_TYPES.rejection
  }

  if (isCustomTxInfo(txInfo)) {
    if (isWalletConnectSafeApp(details.safeAppInfo?.url || '')) {
      return TX_TYPES.walletconnect
    }

    if (details.safeAppInfo) {
      return TX_TYPES.safeapps
    }

    if (isMultiSendTxInfo(txInfo)) {
      return TX_TYPES.batch
    }
  }

  return TX_TYPES.custom
}
