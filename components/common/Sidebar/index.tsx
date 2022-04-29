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
import useSafeAddress from '@/services/useSafeAddress'
import useWallet from '@/services/wallets/useWallet'

const Sidebar = (): ReactElement => {
  const [txOpen, setTxOpen] = useState<boolean>(false)
  const { address, chainId } = useSafeAddress()
  const { error, loading, safe } = useSafeInfo()
  const wallet = useWallet()
  const isOwner = wallet && safe?.owners.some((item) => item.value.toLowerCase() === wallet.address.toLocaleLowerCase())
  const wrongChain = wallet && wallet.chainId !== chainId

  return (
    <div className={css.container}>
      <div className={css.chain}>
        <ChainIndicator />
      </div>

      {!error && <SafeHeader />}

      <div className={css.newTxButton}>
        <Button onClick={() => setTxOpen(true)} variant="contained" disabled={!wallet || !isOwner}>
          {isOwner ? 'New Transaction' : !wallet ? 'Not connected' : wrongChain ? 'Wrong wallet chain' : 'Read only'}
        </Button>

        {txOpen && <TxModal onClose={() => setTxOpen(false)} />}
      </div>

      {address && <Navigation />}

      {!error && <SafeList />}

      {loading && 'Loading Safe info...'}

      {error && <ErrorToast message="Failed loading the Safe" />}
    </div>
  )
}

export default Sidebar
