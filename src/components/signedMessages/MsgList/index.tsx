import type { ReactElement } from 'react'

import { TxListGrid } from '@/components/transactions/TxList'
import MsgListItem from '@/components/signedMessages/MsgListItem'
import type { SignedMessageListPage } from '@/store/signedMessagesSlice'

const MsgList = ({ items }: { items: SignedMessageListPage['results'] }): ReactElement => {
  return (
    <TxListGrid>
      {items.map((item, i) => (
        <MsgListItem item={item} key={i} />
      ))}
    </TxListGrid>
  )
}

export default MsgList
