import type { ReactElement } from 'react'

import { TxListGrid } from '@/components/transactions/TxList'
import MsgListItem from '@/components/safeMessages/MsgListItem'
import type { SafeMessageListPage } from '@/store/safeMessagesSlice'

const MsgList = ({ items }: { items: SafeMessageListPage['results'] }): ReactElement => {
  return (
    <TxListGrid>
      {items.map((item, i) => (
        <MsgListItem item={item} key={i} />
      ))}
    </TxListGrid>
  )
}

export default MsgList
