import { useMemo } from 'react'
import {
  SettingsInfoType,
  TransferDirection,
  type AddressEx,
  type TransactionSummary,
} from '@gnosis.pm/safe-react-gateway-sdk'

import {
  isCancellationTxInfo,
  isModuleExecutionInfo,
  isTxQueued,
  TransactionInfoType,
} from '@/utils/transaction-guards'
import { DEFAULT_MODULE_NAME } from '@/components/settings/SafeModules'

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

type TxType = {
  icon: string
  text: string
}

const getTxType = (tx: TransactionSummary): TxType => {
  const toAddress = getTxTo(tx)

  switch (tx.txInfo.type) {
    case TransactionInfoType.CREATION: {
      return {
        icon: toAddress?.logoUri || '/images/settings.svg',
        text: 'Safe created',
      }
    }
    case TransactionInfoType.TRANSFER: {
      const isSendTx = tx.txInfo.direction === TransferDirection.OUTGOING

      return {
        icon: isSendTx ? '/images/outgoing.svg' : '/images/incoming.svg',
        text: isSendTx ? (isTxQueued(tx.txStatus) ? 'Send' : 'Sent') : 'Received',
      }
    }
    case TransactionInfoType.SETTINGS_CHANGE: {
      // deleteGuard doesn't exist in Solidity
      // It is decoded as 'setGuard' with a settingsInfo.type of 'DELETE_GUARD'
      const isDeleteGuard = tx.txInfo.settingsInfo?.type === SettingsInfoType.DELETE_GUARD

      return {
        icon: '/images/settings.svg',
        text: isDeleteGuard ? 'deleteGuard' : tx.txInfo.dataDecoded.method,
      }
    }
    case TransactionInfoType.CUSTOM: {
      if (isModuleExecutionInfo(tx.executionInfo)) {
        return {
          icon: toAddress?.logoUri || '/images/settings.svg',
          text: toAddress?.name || DEFAULT_MODULE_NAME,
        }
      }

      if (isCancellationTxInfo(tx.txInfo)) {
        return {
          icon: '/images/circle-cross-red.svg',
          text: 'On-chain rejection',
        }
      }

      if (tx.safeAppInfo) {
        return {
          icon: tx.safeAppInfo.logoUri,
          text: tx.safeAppInfo.name,
        }
      }

      return {
        icon: toAddress?.logoUri || '/images/custom.svg',
        text: toAddress?.name || 'Contract interaction',
      }
    }
    default: {
      return {
        icon: '/images/custom.svg',
        text: 'Contract interaction',
      }
    }
  }
}

export const useTransactionType = (tx: TransactionSummary): TxType => {
  return useMemo(() => {
    return getTxType(tx)
  }, [tx])
}
