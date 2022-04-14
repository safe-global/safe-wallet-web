import { useAppSelector } from 'store'
import type { ReactElement } from 'react'

import useSafeAddress from 'services/useSafeAddress'
import { selectChainById } from 'store/chainsSlice'
import { selectSafeInfo } from 'store/safeInfoSlice'
import SafeHeader from 'components/common/SafeHeader'
import SafeList from 'components/common/SafeList'
import css from 'components/common/Sidebar/styles.module.css'

const Sidebar = (): ReactElement => {
  const { safe, error } = useAppSelector(selectSafeInfo)
  const { chainId, address } = useSafeAddress()
  const chainConfig = useAppSelector((state) => selectChainById(state, chainId))

  const loading = safe.address.value !== address

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
