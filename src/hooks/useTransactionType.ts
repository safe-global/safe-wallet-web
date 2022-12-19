import { useMemo } from 'react'
import {
  SettingsInfoType,
  TransactionInfoType,
  TransferDirection,
  type AddressEx,
  type TransactionSummary,
} from '@safe-global/safe-gateway-typescript-sdk'

import { isCancellationTxInfo, isModuleExecutionInfo, isTxQueued } from '@/utils/transaction-guards'
import useAddressBook from './useAddressBook'
import type { AddressBook } from '@/store/addressBookSlice'

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

export const getTransactionType = (tx: TransactionSummary, addressBook: AddressBook): TxType => {
  const toAddress = getTxTo(tx)
  const addressBookName = toAddress?.value ? addressBook[toAddress.value] : undefined

  switch (tx.txInfo.type) {
    case TransactionInfoType.CREATION: {
      return {
        icon: toAddress?.logoUri || '/images/transactions/settings.svg',
        text: 'Safe created',
      }
    }
    case TransactionInfoType.TRANSFER: {
      const isSendTx = tx.txInfo.direction === TransferDirection.OUTGOING

      return {
        icon: isSendTx ? '/images/transactions/outgoing.svg' : '/images/transactions/incoming.svg',
        text: isSendTx ? (isTxQueued(tx.txStatus) ? 'Send' : 'Sent') : 'Received',
      }
    }
    case TransactionInfoType.SETTINGS_CHANGE: {
      // deleteGuard doesn't exist in Solidity
      // It is decoded as 'setGuard' with a settingsInfo.type of 'DELETE_GUARD'
      const isDeleteGuard = tx.txInfo.settingsInfo?.type === SettingsInfoType.DELETE_GUARD

      return {
        icon: '/images/transactions/settings.svg',
        text: isDeleteGuard ? 'deleteGuard' : tx.txInfo.dataDecoded.method,
      }
    }
    case TransactionInfoType.CUSTOM: {
      if (isModuleExecutionInfo(tx.executionInfo)) {
        return {
          icon: toAddress?.logoUri || '/images/transactions/custom.svg',
          text: toAddress?.name || 'Contract interaction',
        }
      }

      if (isCancellationTxInfo(tx.txInfo)) {
        return {
          icon: '/images/transactions/circle-cross-red.svg',
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
        icon: toAddress?.logoUri || '/images/transactions/custom.svg',
        text: addressBookName || toAddress?.name || 'Contract interaction',
      }
    }
    default: {
      return {
        icon: '/images/transactions/custom.svg',
        text: addressBookName || 'Contract interaction',
      }
    }
  }
}

export const useTransactionType = (tx: TransactionSummary): TxType => {
  const addressBook = useAddressBook()

  return useMemo(() => {
    return getTransactionType(tx, addressBook)
  }, [tx, addressBook])
}
