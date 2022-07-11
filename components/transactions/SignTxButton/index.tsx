import React, { useState, type ReactElement } from 'react'
import { type TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { Tooltip } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import IconButton from '@mui/material/IconButton'

import { isOwner, isSignableBy } from '@/utils/transaction-guards'
import useWallet from '@/hooks/wallets/useWallet'
import useSafeInfo from '@/hooks/useSafeInfo'
import ConfirmTxModal from '@/components/tx/modals/ConfirmTxModal'
import useIsPending from '@/hooks/useIsPending'

const SignTxButton = ({ txSummary }: { txSummary: TransactionSummary }): ReactElement => {
  const [open, setOpen] = useState<boolean>(false)
  const { safe } = useSafeInfo()
  const wallet = useWallet()
  const signaturePending = isSignableBy(txSummary, wallet?.address || '')
  const granted = isOwner(safe?.owners, wallet?.address)
  const isPending = useIsPending({ txId: txSummary.id })

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setOpen(true)
  }

  const isDisabled = !signaturePending || !granted || isPending

  return (
    <>
      <Tooltip title="Sign" arrow placement="top">
        <span>
          <IconButton onClick={onClick} color="primary" disabled={isDisabled} size="small">
            <CheckIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      {open && <ConfirmTxModal onClose={() => setOpen(false)} initialData={[txSummary]} />}
    </>
  )
}

export default SignTxButton
