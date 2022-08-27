import type { ReactElement } from 'react'
import type { TransactionListPage } from '@gnosis.pm/safe-react-gateway-sdk'
import TxListItem from '../TxListItem'
import GroupedTxListItems from '@/components/transactions/GroupedTxListItems'
import css from './styles.module.css'
import BatchExecuteButton from '@/components/transactions/BatchExecuteButton'
import { BatchExecuteHoverProvider } from '@/components/transactions/BatchExecuteButton/BatchExecuteHoverProvider'
import { useRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'
import TxFilterButton from '@/components/transactions/TxFilterButton'
import useGroupedTxs from '@/hooks/useGroupedTxs'

type TxListProps = {
  items: TransactionListPage['results']
  isFirstPage: boolean
}

export const TxListGrid = ({ children }: { children: ReactElement | ReactElement[] }): ReactElement => {
  return <div className={css.listContainer}>{children}</div>
}

const TxList = ({ items, isFirstPage }: TxListProps): ReactElement => {
  const router = useRouter()

  const groupedTxs = useGroupedTxs(items)

  const isQueue = router.pathname === AppRoutes.safe.transactions.queue

  const transactions = groupedTxs.map((item, index) => {
    if (Array.isArray(item)) {
      return <GroupedTxListItems key={index} groupedListItems={item} />
    }

    return <TxListItem key={index} item={item} />
  })

  if (!isFirstPage) {
    return <TxListGrid>{transactions}</TxListGrid>
  }

  // We only want to render the batch/filter on first page, otherwise every `TxListGrid`
  // will have stacked buttons, batch hover provider and filter

  // TODO: Improve `BatchExecuteHoverProvider` position as our batch limit > page
  return (
    <BatchExecuteHoverProvider>
      <TxListGrid>
        {isQueue ? (
          <BatchExecuteButton items={groupedTxs} className={css.button} />
        ) : (
          <TxFilterButton className={css.button} />
        )}
        <>{transactions}</>
      </TxListGrid>
    </BatchExecuteHoverProvider>
  )
}

export default TxList
