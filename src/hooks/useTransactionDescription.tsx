import { type ReactNode, useMemo } from 'react'
import {
  SettingsInfoType,
  TransactionInfoType,
  TransferDirection,
  type AddressEx,
  type TransactionSummary,
  type Transfer,
  type SettingsChange,
  type Custom,
  type MultiSend,
  type SafeAppInfo,
} from '@safe-global/safe-gateway-typescript-sdk'

import { isCancellationTxInfo, isModuleExecutionInfo, isMultiSendTxInfo } from '@/utils/transaction-guards'
import useAddressBook from './useAddressBook'
import type { AddressBook } from '@/store/addressBookSlice'
import css from '@/components/transactions/TxSummary/styles.module.css'
import humanDescriptionCss from '@/components/transactions/HumanDescription/styles.module.css'
import { shortenAddress } from '@/utils/formatters'
import EthHashInfo from '@/components/common/EthHashInfo'
import { TransferTx } from '@/components/transactions/TxInfo'
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

const TransferDescription = ({ txInfo, isSendTx }: { txInfo: Transfer; isSendTx: boolean }) => {
  return (
    <>
      {isSendTx ? 'Send' : 'Receive'}
      <TransferTx info={txInfo} omitSign={true} size={16} />
      <>
        {isSendTx ? 'to' : 'from'}
        <div className={humanDescriptionCss.address}>
          <EthHashInfo address={txInfo.recipient.value} name={txInfo.recipient.name} avatarSize={20} />
        </div>
      </>
    </>
  )
}

const SettingsChangeDescription = ({ info }: { info: SettingsChange }) => {
  const isDeleteGuard = info.settingsInfo?.type === SettingsInfoType.DELETE_GUARD

  if (isDeleteGuard) return <>deleteGuard</>

  if (
    info.settingsInfo?.type === SettingsInfoType.ENABLE_MODULE ||
    info.settingsInfo?.type === SettingsInfoType.DISABLE_MODULE
  ) {
    return <>{info.settingsInfo.module.name}</>
  }

  return <>{info.dataDecoded.method}</>
}

const SafeAppTxDescription = ({
  info,
  safeAppInfo,
  addressName,
}: {
  info: Custom | MultiSend
  safeAppInfo: SafeAppInfo
  addressName?: string
}) => {
  const origin = addressName ? (
    <>
      on <b className={css.method}>{addressName}</b>
    </>
  ) : undefined

  const name = safeAppInfo.name ? (
    <>
      via
      <b className={css.method}>
        <SafeAppIconCard
          src={safeAppInfo.logoUri}
          alt="Transaction icon"
          width={16}
          height={16}
          fallback="/images/transactions/custom.svg"
        />
        {safeAppInfo.name}
      </b>
    </>
  ) : undefined

  const method = info.methodName ? (
    <>
      <span>Called </span>
      <b className={css.method}>{info.methodName}</b>
    </>
  ) : undefined

  return (
    <>
      {method}
      {origin || name}
      {isMultiSendTxInfo(info) && ` with ${info.actionCount} action${info.actionCount > 1 ? 's' : ''}`}
    </>
  )
}

const CustomTxDescription = ({ info, addressName }: { info: Custom | MultiSend; addressName?: string }) => {
  return (
    <>
      {addressName || 'Contract interaction'}
      {info.methodName && ': '}
      {info.methodName ? <b className={css.method}>{info.methodName}</b> : ''}
      {isMultiSendTxInfo(info) && `with ${info.actionCount} action${info.actionCount > 1 ? 's' : ''}`}
    </>
  )
}

export const getTransactionDescription = (tx: TransactionSummary, addressBook: AddressBook): TxType => {
  const toAddress = getTxTo(tx)
  const addressName = addressBook[toAddress?.value || ''] || toAddress?.name

  switch (tx.txInfo.type) {
    case TransactionInfoType.CREATION: {
      return {
        icon: toAddress?.logoUri || '/images/transactions/settings.svg',
        text: `Safe Account created by ${shortenAddress(tx.txInfo.creator.value)}`,
      }
    }

    case TransactionInfoType.TRANSFER: {
      const isSendTx = tx.txInfo.direction === TransferDirection.OUTGOING

      return {
        icon: isSendTx ? '/images/transactions/outgoing.svg' : '/images/transactions/incoming.svg',
        text: <TransferDescription txInfo={tx.txInfo} isSendTx={isSendTx} />,
      }
    }

    case TransactionInfoType.SETTINGS_CHANGE: {
      return {
        icon: '/images/transactions/settings.svg',
        text: <SettingsChangeDescription info={tx.txInfo} />,
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
          icon: '/images/transactions/custom.svg',
          text: <SafeAppTxDescription info={tx.txInfo} safeAppInfo={tx.safeAppInfo} addressName={addressName} />,
        }
      }

      return {
        icon: toAddress?.logoUri || '/images/transactions/custom.svg',
        text: <CustomTxDescription info={tx.txInfo} addressName={addressName} />,
      }
    }

    default: {
      return {
        icon: '/images/transactions/custom.svg',
        text: addressName || 'Contract interaction',
      }
    }
  }
}

export const useTransactionDescription = (tx: TransactionSummary): TxType => {
  const addressBook = useAddressBook()

  return useMemo(() => {
    return getTransactionDescription(tx, addressBook)
  }, [tx, addressBook])
}
