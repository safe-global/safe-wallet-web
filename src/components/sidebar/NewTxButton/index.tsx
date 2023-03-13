import { Suspense, useState, type ReactElement } from 'react'
import dynamic from 'next/dynamic'
import Button from '@mui/material/Button'
import css from './styles.module.css'
import { trackEvent, OVERVIEW_EVENTS } from '@/services/analytics'
import CheckWallet from '@/components/common/CheckWallet'

const NewTxModal = dynamic(() => import('@/components/tx/modals/NewTxModal'))

const NewTxButton = (): ReactElement => {
  const [txOpen, setTxOpen] = useState<boolean>(false)

  const onClick = () => {
    setTxOpen(true)

    trackEvent(OVERVIEW_EVENTS.NEW_TRANSACTION)
  }

  return (
    <>
      <CheckWallet allowSpendingLimit>
        {(isOk) => (
          <Button
            onClick={onClick}
            variant="contained"
            size="small"
            disabled={!isOk}
            fullWidth
            className={css.button}
            disableElevation
          >
            New transaction
          </Button>
        )}
      </CheckWallet>

      {txOpen && (
        <Suspense>
          <NewTxModal onClose={() => setTxOpen(false)} />
        </Suspense>
      )}
    </>
  )
}

export default NewTxButton
