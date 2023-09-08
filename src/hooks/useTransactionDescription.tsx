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
import css from '@/components/transactions/HumanDescription/styles.module.css'
import { shortenAddress } from '@/utils/formatters'
import EthHashInfo from '@/components/common/EthHashInfo'
import { TransferTx } from '@/components/transactions/TxDetails/TxData/Transfer'
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

const TransferDescriptionSimple = ({ txInfo, isSendTx }: { txInfo: Transfer; isSendTx: boolean }) => {
  const action = isSendTx ? 'Send' : 'Receive'
  const direction = isSendTx ? 'to' : 'from'
  const address = isSendTx ? txInfo.recipient.value : txInfo.sender.value

  return (
    <>
      {action}
      <TransferTx info={txInfo} omitSign={true} withLogo={false} size={16} />
      <span>{direction}</span>
      {shortenAddress(address)}
    </>
  )
}

const TransferDescription = ({ txInfo, isSendTx }: { txInfo: Transfer; isSendTx: boolean }) => {
  const action = isSendTx ? 'Send' : 'Receive'
  const direction = isSendTx ? 'to' : 'from'
  const address = isSendTx ? txInfo.recipient.value : txInfo.sender.value
  const name = isSendTx ? txInfo.recipient.name : txInfo.sender.name

  return (
    <>
      {action}
      <TransferTx info={txInfo} omitSign={true} size={20} />
      {direction}
      <div className={css.address}>
        <EthHashInfo address={address} name={name} avatarSize={20} />
      </div>
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

const CustomTxDescription = ({
  info,
  safeAppInfo,
  addressName,
}: {
  info: Custom | MultiSend
  safeAppInfo?: SafeAppInfo
  addressName?: string
}) => {
  const safeAppName = safeAppInfo?.name ? (
    <>
      via
      <span className={css.method}>
        <SafeAppIconCard
          src={safeAppInfo.logoUri}
          alt="Transaction icon"
          width={16}
          height={16}
          fallback="/images/transactions/custom.svg"
        />
        {safeAppInfo.name}
      </span>
    </>
  ) : undefined

  if (!info.methodName) {
    return (
      <>
        Interact with <EthHashInfo address={info.to.value} avatarSize={20} />
        {safeAppName}
      </>
    )
  }

  return (
    <>
      <span>Call</span>
      <b className={css.method}>{info.methodName}</b>
      {safeAppName ?? (
        <>
          <span>on</span>
          {addressName || <EthHashInfo address={info.to.value} avatarSize={20} />}
        </>
      )}
      {isMultiSendTxInfo(info) && <MultiSendDescription actionCount={info.actionCount} />}
    </>
  )
}

const MultiSendDescription = ({ actionCount }: { actionCount: number }) => {
  return (
    <span>
      with {actionCount} action{actionCount > 1 && 's'}
    </span>
  )
}

export const getTransactionDescription = (
  tx: TransactionSummary,
  addressBook: AddressBook,
  simple?: boolean,
): TxType => {
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
        text: simple ? (
          <TransferDescriptionSimple txInfo={tx.txInfo} isSendTx={isSendTx} />
        ) : (
          <TransferDescription txInfo={tx.txInfo} isSendTx={isSendTx} />
        ),
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

      return {
        icon: '/images/transactions/custom.svg',
        text: <CustomTxDescription info={tx.txInfo} safeAppInfo={tx.safeAppInfo} addressName={addressName} />,
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
