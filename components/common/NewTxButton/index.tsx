import { useState, type ReactElement } from 'react'
import { Button } from '@mui/material'
import useSafeInfo from '@/services/useSafeInfo'
import useWallet from '@/services/wallets/useWallet'
import TokenTransferModal from '@/components/tx/modals/TokenTransferModal'
import { isOwner } from '@/components/transactions/utils'

const NewTxButton = (): ReactElement => {
  const [txOpen, setTxOpen] = useState<boolean>(false)
  const { safe } = useSafeInfo()
  const wallet = useWallet()
  const isSafeOwner = wallet && isOwner(safe?.owners, wallet.address)
  const wrongChain = wallet && wallet.chainId !== safe?.chainId

  return (
    <>
      <Button onClick={() => setTxOpen(true)} variant="contained" disabled={!wallet || !isSafeOwner}>
        {isSafeOwner ? 'New Transaction' : !wallet ? 'Not connected' : wrongChain ? 'Wrong wallet chain' : 'Read only'}
      </Button>

      {txOpen && <TokenTransferModal onClose={() => setTxOpen(false)} />}
    </>
  )
}

export default NewTxButton
