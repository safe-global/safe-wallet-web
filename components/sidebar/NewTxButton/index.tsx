import { Suspense, useState, type ReactElement } from 'react'
import dynamic from 'next/dynamic'
import Button from '@mui/material/Button'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import useWallet from '@/hooks/wallets/useWallet'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import css from './styles.module.css'

const NewTxModal = dynamic(() => import('@/components/tx/modals/NewTxModal'))

const NewTxButton = (): ReactElement => {
  const [txOpen, setTxOpen] = useState<boolean>(false)
  const wallet = useWallet()
  const isSafeOwner = useIsSafeOwner()
  const isWrongChain = useIsWrongChain()

  return (
    <>
      <Button
        onClick={() => setTxOpen(true)}
        variant="contained"
        size="small"
        disabled={!isSafeOwner || isWrongChain}
        fullWidth
        className={css.button}
        disableElevation
      >
        {!wallet
          ? 'Not connected'
          : isWrongChain
          ? 'Wrong wallet chain'
          : isSafeOwner
          ? 'New transaction'
          : 'Read only'}
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
