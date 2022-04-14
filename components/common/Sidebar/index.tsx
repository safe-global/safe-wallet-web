import { ReactElement } from 'react'
import useSafeAddress from 'services/useSafeAddress'
import { useAppSelector } from 'store'
import { selectChainById } from 'store/chainsSlice'
import { selectSafeInfo } from 'store/safeInfoSlice'
import SafeHeader from '../SafeHeader'
import SafeList from '../SafeList'
import css from './styles.module.css'

const Sidebar = (): ReactElement => {
  const { loading, error } = useAppSelector(selectSafeInfo)
  const { chainId } = useSafeAddress()
  const chainConfig = useAppSelector((state) => selectChainById(state, chainId))

  return (
    <div className={css.container}>
      <div
        className={css.chain}
        style={{ backgroundColor: chainConfig?.theme.backgroundColor, color: chainConfig?.theme.textColor }}
      >
        {chainConfig?.chainName || ' '}
      </div>

      {!error && <SafeHeader />}

      {!error && <SafeList />}

      {loading ? 'Loading Safe info...' : error ? 'Error loading Safe' : ''}
    </div>
  )
}

export default Sidebar
