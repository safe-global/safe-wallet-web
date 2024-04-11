import type { ReactElement } from 'react'
import type { Label } from '@safe-global/safe-gateway-typescript-sdk'
import { LabelValue } from '@safe-global/safe-gateway-typescript-sdk'
import { useFirstQueuedNonce } from '@/hooks/useTxQueue'
import css from './styles.module.css'

const QueueLabelText = () => {
  const firstNonce = useFirstQueuedNonce()
  return ` - transaction with nonce ${firstNonce} needs to be executed first`
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
