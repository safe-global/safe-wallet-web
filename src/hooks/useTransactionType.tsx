import { type ReactNode, useMemo } from 'react'
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
import css from '@/components/transactions/TxSummary/styles.module.css'
import SafeAppIconCard from '@/components/safe-apps/SafeAppIconCard'

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
  text: ReactNode
}

export const getTransactionType = (tx: TransactionSummary, addressBook: AddressBook): TxType => {
  const toAddress = getTxTo(tx)
  const addressBookName = toAddress?.value ? addressBook[toAddress.value] : undefined

  switch (tx.txInfo.type) {
    case TransactionInfoType.CREATION: {
      return {
        icon: toAddress?.logoUri || '/images/transactions/settings.svg',
        text: 'Safe Account created',
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
        text: isDeleteGuard ? 'deleteGuard' : tx.txInfo.humanDescription || tx.txInfo.dataDecoded.method,
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
          icon: '',
          text: tx.txInfo.humanDescription ?? (
            <>
              {tx.txInfo.methodName ? (
                <>
                  <span>Called </span>
                  <b className={css.method}>{tx.txInfo.methodName}</b>
                  <span> on</span>
                </>
              ) : (
                ''
              )}
              <SafeAppIconCard
                src={tx.safeAppInfo.logoUri}
                alt="Transaction icon"
                width={16}
                height={16}
                fallback="/images/transactions/custom.svg"
              />
              {tx.safeAppInfo.name}
            </>
          ),
        }
      }

      return {
        icon: toAddress?.logoUri || '/images/transactions/custom.svg',
        text: tx.txInfo.humanDescription ?? (
          <>
            {addressBookName || toAddress?.name || 'Contract interaction'}
            {tx.txInfo.methodName && ': '}
            {tx.txInfo.methodName ? <b className={css.method}>{tx.txInfo.methodName}</b> : ''}
          </>
        ),
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
