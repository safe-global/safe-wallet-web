import { Suspense, useState, type ReactElement } from 'react'
import dynamic from 'next/dynamic'
import Button from '@mui/material/Button'
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
          <Button onClick={onClick} disabled={!isOk} variant="outlined" fullWidth>
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
