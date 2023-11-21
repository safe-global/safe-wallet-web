import type { ReactElement } from 'react'

import { TxListGrid } from '@/components/transactions/TxList'
import { RecoveryListItem } from '@/components/recovery/RecoveryListItem'
import { selectAllRecoveryQueues } from '@/store/recoverySlice'
import { useAppSelector } from '@/store'

import labelCss from '@/components/transactions/GroupLabel/styles.module.css'

export function RecoveryList(): ReactElement | null {
  const queue = useAppSelector(selectAllRecoveryQueues)

  if (queue.length === 0) {
    return null
  }

  return (
    <>
      <div className={labelCss.container}>Pending recovery</div>

      <TxListGrid>
        {queue.map((item) => (
          <RecoveryListItem item={item} key={item.transactionHash} />
        ))}
      </TxListGrid>
    </>
  )
}
