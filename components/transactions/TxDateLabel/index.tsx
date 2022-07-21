import { DateLabel } from '@gnosis.pm/safe-react-gateway-sdk'
import { ReactElement } from 'react'
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
