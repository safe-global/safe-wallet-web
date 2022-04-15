import { ReactElement } from 'react'
import { connect } from 'react-redux'
import { shortenAddress } from 'services/formatters'
import { selectBalances } from 'store/balancesSlice'
import { selectSafeInfo } from 'store/safeInfoSlice'
import { RootState } from '../../../store'
import FiatValue from '../FiatValue'
import Identicon from '../Identicon'
import css from './styles.module.css'

interface SafeHeaderProps {
  address: string
  threshold: number
  owners: number
  fiatTotal: string
}

export const SafeHeader = (props: SafeHeaderProps): ReactElement => {
  const { address } = props

  return (
    <div className={css.container}>
      <div className={css.icon}>
        <Identicon address={address} />

        <div className={css.threshold}>
          {props.threshold}/{props.owners}
        </div>
      </div>

      {shortenAddress(address)}

      <div className={css.totalValue}>
        <span>Total value</span>
        <FiatValue value={props.fiatTotal} />
      </div>
    </div>
  )
}

const mapStateToProps = (state: RootState): SafeHeaderProps => {
  const { safe } = selectSafeInfo(state)
  const { fiatTotal } = selectBalances(state)

  return {
    address: safe.address.value,
    threshold: safe.threshold,
    owners: safe.owners.length,
    fiatTotal,
  }
}

export default connect(mapStateToProps)(SafeHeader)
