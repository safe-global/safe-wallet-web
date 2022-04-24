import { ReactElement, useState } from 'react'
import { Button } from '@mui/material'

import useSafeInfo from '@/services/useSafeInfo'
import ChainIndicator from '@/components/common/ChainIndicator'
import SafeHeader from '@/components/common/SafeHeader'
import SafeList from '@/components/common/SafeList'
import ErrorToast from '@/components/common/ErrorToast'
import TxModal from '@/components/tx/TxModal'
import Navigation from '@/components/common/Sidebar/Navigation'

import css from './styles.module.css'

const Sidebar = (): ReactElement => {
  const [txOpen, setTxOpen] = useState<boolean>(false)
  const { error, requestStatus, safe } = useSafeInfo()

  const loading = !safe && requestStatus === 'pending'

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
