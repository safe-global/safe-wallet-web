import { type ReactElement } from 'react'
import { Label } from '@gnosis.pm/safe-react-gateway-sdk'
import css from './styles.module.css'

const GroupLabel = ({ item }: { item: Label }): ReactElement => {
  return <div className={css.container}>{item.label}</div>
}

export default GroupLabel
