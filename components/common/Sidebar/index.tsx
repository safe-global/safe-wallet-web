import { ReactElement } from 'react'
import useSafeAddress from 'services/useSafeAddress'
import { useAppSelector } from 'store'
import { selectSafeInfo } from 'store/safeInfoSlice'
import ChainIndicator from '../ChainIndicator'
import SafeHeader from '../SafeHeader'
import SafeList from '../SafeList'
import css from './styles.module.css'

const Sidebar = (): ReactElement => {
  const { address } = useSafeAddress()
  const { safe, error } = useAppSelector(selectSafeInfo)
  const loading = safe.address.value !== address

  return (
    <div className={css.container}>
      <div className={css.chain}>
        <ChainIndicator />
      </div>

      {!error && <SafeHeader />}

      {!error && <SafeList />}

      {loading ? 'Loading Safe info...' : error ? 'Error loading Safe' : ''}
    </div>
  )
}

export default Sidebar
