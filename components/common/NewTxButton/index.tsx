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
  const isWrongChain = wallet?.chainId !== safe?.chainId

  return (
    <>
      <Button onClick={() => setTxOpen(true)} variant="contained" disabled={!wallet || !isSafeOwner || isWrongChain}>
        {!wallet
          ? 'Not connected'
          : isWrongChain
          ? 'Wrong wallet chain'
          : isSafeOwner
          ? 'New transaction'
          : 'Read only'}
      </Button>

      {txOpen && <TokenTransferModal onClose={() => setTxOpen(false)} />}
    </>
  )
}

export default NewTxButton
