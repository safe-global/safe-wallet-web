import type { ReactElement } from 'react'
import type { Label } from '@safe-global/safe-gateway-typescript-sdk'
import { LabelValue } from '@safe-global/safe-gateway-typescript-sdk'
import css from './styles.module.css'
import useSafeInfo from '@/hooks/useSafeInfo'

const QueueLabelText = () => {
  const { safe } = useSafeInfo()
  return ` - transaction with nonce ${safe.nonce} needs to be executed first`
}

const GroupLabel = ({ item }: { item: Label }): ReactElement => {
  return (
    <div className={css.container}>
      {item.label}
      {item.label === LabelValue.Queued && <QueueLabelText />}
    </div>
  )
}

export default GroupLabel
