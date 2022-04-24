import { ReactElement, useState } from 'react'
import { Button } from '@mui/material'

import css from './styles.module.css'
import useSafeInfo from '@/services/useSafeInfo'
import ChainIndicator from '../ChainIndicator'
import SafeHeader from '../SafeHeader'
import SafeList from '../SafeList'
import ErrorToast from '../ErrorToast'
import TxModal from '@/components/tx/TxModal'
import Navigation from '@/components/common/Sidebar/Navigation'

const Sidebar = (): ReactElement => {
  const [txOpen, setTxOpen] = useState<boolean>(false)
  const { error, requestStatus } = useSafeInfo()

  const loading = requestStatus === 'pending'

  return (
    <div className={css.container}>
      <div className={css.chain}>
        <ChainIndicator />
      </div>

      {!error && <SafeHeader />}

      <Button onClick={() => setTxOpen(true)} variant="contained" sx={{ margin: '20px 0' }}>
        New Transaction
      </Button>

      {txOpen && <TxModal onClose={() => setTxOpen(false)} />}

      <Navigation />

      {!error && <SafeList />}

      {loading && 'Loading Safe info...'}

      {error && <ErrorToast message="Failed loading the Safe" />}
    </div>
  )
}

export default Sidebar
