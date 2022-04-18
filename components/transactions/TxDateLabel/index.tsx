import { DateLabel } from '@gnosis.pm/safe-react-gateway-sdk'
import DateTime from '@/components/common/DateTime'
import { ReactElement } from 'react'
import css from './styles.module.css'

const dateOptions = {
  dateStyle: 'long',
}

const TxDateLabel = ({ item }: { item: DateLabel }): ReactElement => {
  return (
    <div className={css.container}>
      <DateTime value={item.timestamp} options={dateOptions} />
    </div>
  )
}

export default TxDateLabel
