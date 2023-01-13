import type { DateLabel } from '@safe-global/safe-gateway-typescript-sdk'
import type { ReactElement } from 'react'
import css from './styles.module.css'
import { formatWithSchema } from '@/utils/date'

const TxDateLabel = ({ item }: { item: DateLabel }): ReactElement => {
  return (
    <div className={css.container}>
      <span>{formatWithSchema(item.timestamp, 'MMM d, yyyy')}</span>
    </div>
  )
}

export default TxDateLabel
