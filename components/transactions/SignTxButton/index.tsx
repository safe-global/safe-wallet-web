import { useState, type ReactElement, SyntheticEvent } from 'react'
import { type TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { Tooltip } from '@mui/material'

import { isSignableBy } from '@/utils/transaction-guards'
import useWallet from '@/hooks/wallets/useWallet'
import ConfirmTxModal from '@/components/tx/modals/ConfirmTxModal'
import useIsPending from '@/hooks/useIsPending'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'

const SignTxButton = ({
  txSummary,
  children,
}: {
  txSummary: TransactionSummary
  children: (onClick: (e: SyntheticEvent) => void, isDisabled: boolean) => ReactElement
}): ReactElement => {
  const [open, setOpen] = useState<boolean>(false)
  const wallet = useWallet()
  const signaturePending = isSignableBy(txSummary, wallet?.address || '')
  const isSafeOwner = useIsSafeOwner()
  const isPending = useIsPending({ txId: txSummary.id })

  const onClick = (e: SyntheticEvent) => {
    e.stopPropagation()
    setOpen(true)
  }

  const isDisabled = !signaturePending || !isSafeOwner || isPending

  return (
    <>
      <Tooltip title="Sign" arrow placement="top">
        {children(onClick, isDisabled)}
      </Tooltip>

      {open && <ConfirmTxModal onClose={() => setOpen(false)} initialData={[txSummary]} />}
    </>
  )
}

export default SignTxButton
