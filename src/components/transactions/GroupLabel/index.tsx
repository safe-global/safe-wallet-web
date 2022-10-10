import type { ReactNode, ReactElement } from 'react'
import type { Label } from '@gnosis.pm/safe-react-gateway-sdk'
import { LabelValue } from '@gnosis.pm/safe-react-gateway-sdk'
import css from './styles.module.css'
import useSafeInfo from '@/hooks/useSafeInfo'

export const useFutureNonceLabel = (label: LabelValue) => {
  const { safe } = useSafeInfo()
  if (label !== LabelValue.Queued) return label
  return `${label} - transaction with nonce ${safe.nonce} needs to be executed first`
}

export const GroupLabelTypography = ({ children }: { children: ReactNode }) => {
  return <div className={css.container}>{children}</div>
}

const GroupLabel = ({ item }: { item: Label }): ReactElement => {
  const label = useFutureNonceLabel(item.label)
  return <GroupLabelTypography>{label}</GroupLabelTypography>
}

export default GroupLabel
