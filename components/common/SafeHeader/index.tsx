import { type ReactElement } from 'react'
import { shortenAddress } from '@/services/formatters'
import useSafeInfo from '@/services/useSafeInfo'
import useBalances from '@/services/useBalances'
import FiatValue from '../FiatValue'
import Identicon from '../Identicon'
import css from './styles.module.css'

interface SafeHeaderProps {
  address: string
  threshold: number
  owners: number
  fiatTotal: string
}

const SafeHeader = (): ReactElement => {
  const { safe } = useSafeInfo()
  const { fiatTotal } = useBalances()

  const address = safe?.address.value || ''
  const { threshold, owners } = safe || {}

  return (
    <div className={css.container}>
      <div className={css.icon}>
        <Identicon address={address} />

        <div className={css.threshold}>
          {threshold || ''}/{owners?.length || ''}
        </div>
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
