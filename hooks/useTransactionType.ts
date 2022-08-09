import { useEffect, useState } from 'react'
import { AddressEx, SettingsInfoType, TransactionSummary, TransferDirection } from '@gnosis.pm/safe-react-gateway-sdk'
import { isCancellationTxInfo, isCustomTxInfo, isModuleExecutionInfo, isTxQueued } from '@/utils/transaction-guards'

type TxTypeProps = {
  icon?: string
  fallbackIcon?: string
  text?: string
}

const getTxTo = ({ txInfo }: Pick<TransactionSummary, 'txInfo'>): AddressEx | undefined => {
  switch (txInfo.type) {
    case 'Transfer': {
      return txInfo.recipient
    }
    case 'SettingsChange': {
      return undefined
    }
    case 'Custom': {
      return txInfo.to
    }
    case 'Creation': {
      return txInfo.factory
    }
  }
}

export const useTransactionType = (tx: TransactionSummary): TxTypeProps => {
  const [type, setType] = useState<TxTypeProps>({ icon: '/images/custom.svg', text: 'Contract interaction' })
  const toAddress = getTxTo(tx)

  useEffect(() => {
    switch (tx.txInfo.type) {
      case 'Creation': {
        setType({
          icon: toAddress?.logoUri || '/images/settings.svg',
          text: 'Safe created',
        })
        break
      }
      case 'Transfer': {
        const isSendTx = tx.txInfo.direction === TransferDirection.OUTGOING

        setType({
          icon: isSendTx ? '/images/outgoing.svg' : '/images/incoming.svg',
          text: isSendTx ? (isTxQueued(tx.txStatus) ? 'Send' : 'Sent') : 'Received',
        })
        break
      }
      case 'SettingsChange': {
        // deleteGuard doesn't exist in Solidity
        // It is decoded as 'setGuard' with a settingsInfo.type of 'DELETE_GUARD'
        const isDeleteGuard = tx.txInfo.settingsInfo?.type === SettingsInfoType.DELETE_GUARD
        setType({ icon: '/images/settings.svg', text: isDeleteGuard ? 'deleteGuard' : tx.txInfo.dataDecoded.method })
        break
      }
      case 'Custom': {
        if (isModuleExecutionInfo(tx.executionInfo)) {
          const DEFAULT_MODULE_NAME = 'Module'

          const isCustom = isCustomTxInfo(tx.txInfo)
          const { logoUri, name } = tx.txInfo.to

          setType({
            icon: isCustom && logoUri ? logoUri : '/images/settings.svg',
            text: isCustom && name ? name : DEFAULT_MODULE_NAME,
          })
          break
        }

        if (isCancellationTxInfo(tx.txInfo)) {
          setType({ icon: '/images/circle-cross-red.svg', text: 'On-chain rejection' })
          break
        }

        if (tx.safeAppInfo) {
          setType({ icon: tx.safeAppInfo.logoUri, text: tx.safeAppInfo.name })
          break
        }

        setType({
          icon: toAddress?.logoUri || '/images/custom.svg',
          text: toAddress?.name || 'Contract interaction',
        })
        break
      }
    }
  }, [tx, toAddress?.logoUri, toAddress?.name])

  return type
}
