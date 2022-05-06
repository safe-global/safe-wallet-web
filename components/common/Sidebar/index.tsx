import { type ReactElement } from 'react'

import css from './styles.module.css'
import useSafeInfo from '@/services/useSafeInfo'
import ChainIndicator from '../ChainIndicator'
import SafeHeader from '../SafeHeader'
import SafeList from '../SafeList'
import ErrorToast from '../ErrorToast'
import Navigation from '@/components/common/Navigation'
import useSafeAddress from '@/services/useSafeAddress'
import useWallet from '@/services/wallets/useWallet'
import NewTxButton from '../NewTxButton'

const Sidebar = (): ReactElement => {
  const { address } = useSafeAddress()
  const { error, loading } = useSafeInfo()
  const wallet = useWallet()

  return (
    <div className={css.container}>
      <div className={css.chain}>
        <ChainIndicator />
      </div>

      {/* For routes with a Safe address */}
      {address ? (
        <>
          {!error && <SafeHeader />}

          <div className={css.newTxButton}>
            <NewTxButton />
          </div>

          <Navigation />

          {loading && 'Loading Safe info...'}

          {error && <ErrorToast message="Failed loading the Safe" />}
        </>
      ) : (
        <div className={css.noSafeSidebar} />
      )}

      {wallet && <SafeList />}
    </div>
  )
}

export default Sidebar
