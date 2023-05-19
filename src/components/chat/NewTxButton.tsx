import CheckWallet from '@/components/common/CheckWallet'
import { OVERVIEW_EVENTS, trackEvent } from '@/services/analytics'
import Button from '@mui/material/Button'
import dynamic from 'next/dynamic'
import { Suspense, useState, type ReactElement } from 'react'
import css from '@/components/chat/styles.module.css'

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
          <Button onClick={onClick} disabled={!isOk} variant="outlined" className={css.buttonstyled} size="small">
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
