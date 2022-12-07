import type { ReactElement } from 'react'
import type { SafeMessageListPage } from '@gnosis.pm/safe-react-gateway-sdk'

import { TxListGrid } from '@/components/transactions/TxList'
import MsgListItem from '@/components/safe-messages/MsgListItem'

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
