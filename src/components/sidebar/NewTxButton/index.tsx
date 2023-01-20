import { Suspense, useState, type ReactElement } from 'react'
import dynamic from 'next/dynamic'
import Button from '@mui/material/Button'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import useWallet from '@/hooks/wallets/useWallet'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import css from './styles.module.css'
import { trackEvent, OVERVIEW_EVENTS } from '@/services/analytics'
import ChainSwitcher from '@/components/common/ChainSwitcher'
import useIsOnlySpendingLimitBeneficiary from '@/hooks/useIsOnlySpendingLimitBeneficiary'

const NewTxModal = dynamic(() => import('@/components/tx/modals/NewTxModal'))

const NewTxButton = (): ReactElement => {
  const [txOpen, setTxOpen] = useState<boolean>(false)
  const wallet = useWallet()
  const isSafeOwner = useIsSafeOwner()
  const isOnlySpendingLimitBeneficiary = useIsOnlySpendingLimitBeneficiary()
  const isWrongChain = useIsWrongChain()

  const canCreateTx = isSafeOwner || isOnlySpendingLimitBeneficiary

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
        disabled={!canCreateTx || isWrongChain}
        fullWidth
        className={css.button}
        disableElevation
      >
        {!wallet ? 'Not connected' : canCreateTx ? 'New transaction' : 'Read only'}
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
