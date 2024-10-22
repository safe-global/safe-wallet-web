import { useMemo } from 'react'
import {
  type AddressEx,
  SettingsInfoType,
  SwapOrder,
  TransactionInfoType,
  type TransactionSummary,
} from '@safe-global/safe-gateway-typescript-sdk'
import type { AnyAppDataDocVersion, latest } from '@cowprotocol/app-data'

import {
  isCancellationTxInfo,
  isModuleExecutionInfo,
  isMultiSendTxInfo,
  isOutgoingTransfer,
  isTxQueued,
} from '@/src/utils/transaction-guards'

const getTxTo = ({ txInfo }: Pick<TransactionSummary, 'txInfo'>): AddressEx | undefined => {
  switch (txInfo.type) {
    case TransactionInfoType.CREATION: {
      return txInfo.factory
    }
    case TransactionInfoType.TRANSFER: {
      return txInfo.recipient
    }
    case TransactionInfoType.SETTINGS_CHANGE: {
      return undefined
    }
    case TransactionInfoType.CUSTOM: {
      return txInfo.to
    }
  }
}

interface TxType {
  text: string
}

export const getOrderClass = (order: Pick<SwapOrder, 'fullAppData'>): latest.OrderClass1 => {
  const fullAppData = order.fullAppData as AnyAppDataDocVersion
  const orderClass = (fullAppData?.metadata?.orderClass as latest.OrderClass)?.orderClass

  return orderClass || 'market'
}

export const getTransactionType = (tx: TransactionSummary): TxType => {
  const toAddress = getTxTo(tx)

  switch (tx.txInfo.type) {
    case TransactionInfoType.CREATION: {
      return {
        text: 'Safe Account created',
      }
    }
    case TransactionInfoType.SWAP_TRANSFER:
    case TransactionInfoType.TRANSFER: {
      const isSendTx = isOutgoingTransfer(tx.txInfo)

      return {
        text: isSendTx ? (isTxQueued(tx.txStatus) ? 'Send' : 'Sent') : 'Received',
      }
    }
    case TransactionInfoType.SETTINGS_CHANGE: {
      // deleteGuard doesn't exist in Solidity
      // It is decoded as 'setGuard' with a settingsInfo.type of 'DELETE_GUARD'
      const isDeleteGuard = tx.txInfo.settingsInfo?.type === SettingsInfoType.DELETE_GUARD

      return {
        text: isDeleteGuard ? 'deleteGuard' : tx.txInfo.dataDecoded.method,
      }
    }
    case TransactionInfoType.SWAP_ORDER: {
      const orderClass = getOrderClass(tx.txInfo)
      const altText = orderClass === 'limit' ? 'Limit order' : 'Swap order'

      return {
        text: altText,
      }
    }
    case TransactionInfoType.TWAP_ORDER: {
      return {
        text: 'TWAP order',
      }
    }
    case TransactionInfoType.CUSTOM: {
      if (isMultiSendTxInfo(tx.txInfo) && !tx.safeAppInfo) {
        return {
          text: 'Batch',
        }
      }

      if (isModuleExecutionInfo(tx.executionInfo)) {
        return {
          text: toAddress?.name || 'Contract interaction',
        }
      }

      if (isCancellationTxInfo(tx.txInfo)) {
        return {
          text: 'On-chain rejection',
        }
      }

      return {
        text: toAddress?.name || 'Contract interaction',
      }
    }
    default: {
      if (tx.safeAppInfo) {
        return {
          text: tx.safeAppInfo.name,
        }
      }

      return {
        text: 'Contract interaction',
      }
    }
  }
}

// We're going to need the address book in the future
export const useTransactionType = (tx: TransactionSummary): TxType => {
  // addressBook = useAddressBook

  return useMemo(() => {
    return getTransactionType(tx)
  }, [tx])
}
