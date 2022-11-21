import type { ReactElement } from 'react'

import { TxListGrid } from '@/components/transactions/TxList'
import MsgListItem from '@/components/messages/MsgListItem'
import type { MessageListPage } from '@/hooks/useMessages'

const MsgList = ({ items }: { items: MessageListPage['results'] }): ReactElement => {
  return (
    <TxListGrid>
      {items.map((item, i) => (
        <MsgListItem item={item} key={i} />
      ))}
    </TxListGrid>
  )
}

export default MsgList
