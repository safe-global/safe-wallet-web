import { Button } from '@mui/material'
import useSafeAddress from '@/services/useSafeAddress'
import useSafeInfo from '@/services/useSafeInfo'
import useWallet from '@/services/wallets/useWallet'
import { useState, type ReactElement } from 'react'
import TokenTransferModal from '@/components/tx/TokenTransferModal'

const NewTxButton = (): ReactElement => {
  const [txOpen, setTxOpen] = useState<boolean>(false)
  const { chainId } = useSafeAddress()
  const { safe } = useSafeInfo()
  const wallet = useWallet()
  const isOwner = wallet && safe?.owners.some((item) => item.value.toLowerCase() === wallet.address.toLocaleLowerCase())
  const wrongChain = wallet && wallet.chainId !== chainId

  return (
    <>
      <Button onClick={() => setTxOpen(true)} variant="contained" disabled={!wallet || !isOwner}>
        {isOwner ? 'New Transaction' : !wallet ? 'Not connected' : wrongChain ? 'Wrong wallet chain' : 'Read only'}
      </Button>

      {txOpen && <TokenTransferModal onClose={() => setTxOpen(false)} />}
    </>
  )
}

export default NewTxButton
