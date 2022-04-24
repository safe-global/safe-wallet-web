import type { ReactElement } from 'react'

import useSafeInfo from '@/services/useSafeInfo'
import useBalances from '@/services/useBalances'
import { shortenAddress } from '@/services/formatters'
import FiatValue from '@/components/common/FiatValue'
import Identicon from '@/components/common/Identicon'

import css from './styles.module.css'

export const SafeHeader = (): ReactElement => {
  const { safe } = useSafeInfo()
  const { fiatTotal } = useBalances()

  const address = safe?.address?.value || ''
  const threshold = safe?.threshold || 0
  const owners = safe?.owners.length || 0

  return (
    <div className={css.container}>
      <div className={css.icon}>
        <Identicon address={address} />

        <div className={css.threshold}>{`${threshold}/${owners}`}</div>
      </div>

      {shortenAddress(address)}

      <div className={css.totalValue}>
        <span>Total value</span>
        <FiatValue value={fiatTotal} />
      </div>
    </div>
  )
}

export default SafeHeader
