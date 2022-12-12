import { Suspense, useState, type ReactElement } from 'react'
import dynamic from 'next/dynamic'
import Button from '@mui/material/Button'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import useWallet from '@/hooks/wallets/useWallet'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import css from './styles.module.css'
import { trackEvent, OVERVIEW_EVENTS } from '@/services/analytics'
import ChainSwitcher from '@/components/common/ChainSwitcher'

const NewTxModal = dynamic(() => import('@/components/tx/modals/NewTxModal'))

const NewTxButton = (): ReactElement => {
  const [txOpen, setTxOpen] = useState<boolean>(false)
  const wallet = useWallet()
  const isSafeOwner = useIsSafeOwner()
  const isWrongChain = useIsWrongChain()

  const onClick = () => {
    setTxOpen(true)

    trackEvent(OVERVIEW_EVENTS.NEW_TRANSACTION)
  }

  if (isWrongChain) return <ChainSwitcher fullWidth />

  return (
    <>
      <Button
        onClick={onClick}
        variant="contained"
        size="small"
        disabled={!isSafeOwner || isWrongChain || wallet?.sanctioned}
        fullWidth
        className={css.button}
        disableElevation
      >
        {!wallet ? 'Not connected' : isSafeOwner && !wallet?.sanctioned ? 'New transaction' : 'Read only'}
      </Button>

      {txOpen && (
        <Suspense>
          <NewTxModal onClose={() => setTxOpen(false)} />
        </Suspense>
      )}
    </>
  )
}

export default NewTxButton
