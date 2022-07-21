import type { Transaction } from '@gnosis.pm/safe-react-gateway-sdk'
import { useContext, useEffect, useState } from 'react'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'
import { TxHoverContext } from './TxHoverProvider'
import { TransactionStatus } from '@gnosis.pm/safe-react-gateway-sdk'
import { isMultisigExecutionInfo } from '@/utils/transaction-guards'

const events: TxEvent[] = [TxEvent.EXECUTING, TxEvent.FAILED, TxEvent.MINED, TxEvent.REVERTED]

export const useTxHoverProvider = (item: Transaction) => {
  const [txStatus, setTxStatus] = useState<TransactionStatus>(item.transaction.txStatus)
  const { activeHover, setActiveHover } = useContext(TxHoverContext)

  useEffect(() => {
    const unsubFns = events.map((event) =>
      txSubscribe(event, (detail) => {
        const txId = 'txId' in detail ? detail.txId : undefined
        const tx = 'tx' in detail ? detail.tx : undefined
        const executionInfo = isMultisigExecutionInfo(item.transaction.executionInfo)
          ? item.transaction.executionInfo
          : undefined

        setActiveHover(undefined)
        event === TxEvent.EXECUTING && tx?.data.nonce === executionInfo?.nonce && setActiveHover(txId)
      }),
    )

    return () => {
      unsubFns.forEach((unsub) => unsub())
    }
  }, [setActiveHover])

  useEffect(() => {
    if (activeHover && activeHover !== item.transaction.id) {
      setTxStatus(TransactionStatus.WILL_BE_REPLACED)
      return
    }
    setTxStatus(item.transaction.txStatus)
  }, [activeHover, item])

  return txStatus
}
