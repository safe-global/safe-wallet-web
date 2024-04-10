import type { ReactElement } from 'react'
import type { Label } from '@safe-global/safe-gateway-typescript-sdk'
import { LabelValue } from '@safe-global/safe-gateway-typescript-sdk'
import QueueLabelText from './QueueLabelText'
import css from './styles.module.css'

const GroupLabel = ({ item }: { item: Label }): ReactElement => {
  return (
    <div className={css.container}>
      {item.label}
      {item.label === LabelValue.Queued && <QueueLabelText />}
    </div>
  )
}

export default GroupLabel
