import useSafeInfo from '@/hooks/useSafeInfo'
import type { Label } from '@safe-global/safe-gateway-typescript-sdk'
import { LabelValue } from '@safe-global/safe-gateway-typescript-sdk'
import type { ReactElement } from 'react'
import css from './styles.module.css'

const GroupLabel = ({ item }: { item: Label }): ReactElement => {
  const { safe } = useSafeInfo()

  const label =
    item.label === LabelValue.Queued
      ? `${item.label} - transaction with nonce ${safe.nonce} needs to be executed first`
      : item.label

  return (
    <div data-sid="49265" className={css.container}>
      {label}
    </div>
  )
}

export default GroupLabel
