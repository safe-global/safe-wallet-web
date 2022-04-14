import { ReactElement } from 'react'
import { connect } from 'react-redux'
import { selectSafeInfo } from 'store/safeInfoSlice'
import { RootState } from '../../../store'
import Identicon from '../Identicon'
import css from './styles.module.css'

interface SafeHeaderProps {
  address: string
  threshold: number
  owners: number
}

export const SafeHeader = (props: SafeHeaderProps): ReactElement => {
  const { address } = props

  return (
    <div className={css.container}>
      <Identicon address={address} />
      <div>
        {props.threshold}/{props.owners}
      </div>
      {address.slice(0, 6)}...{address.slice(-4)}
    </div>
  )
}

const mapStateToProps = (state: RootState): SafeHeaderProps => {
  const { safe } = selectSafeInfo(state)

  return {
    address: safe.address.value,
    threshold: safe.threshold,
    owners: safe.owners.length,
  }
}

export default connect(mapStateToProps)(SafeHeader)
