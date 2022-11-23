import type { DateLabel } from '@gnosis.pm/safe-react-gateway-sdk'
import type { ReactElement } from 'react'
import css from './styles.module.css'
import { formatWithSchema } from '@/utils/date'
import type { SignedMessageDateLabel } from '@/store/signedMessagesSlice'

const TxDateLabel = ({ item }: { item: DateLabel | SignedMessageDateLabel }): ReactElement => {
  return (
    <div className={css.container}>
      <span>{formatWithSchema(item.timestamp, 'MMM d, yyyy')}</span>
    </div>
  )
}

export default TxDateLabel
