import React, { useState, type ReactElement } from 'react'
import { type TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { Tooltip } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import IconButton from '@mui/material/IconButton'

import css from './styles.module.css'
import { isOwner, isSignableBy } from '@/components/transactions/utils'
import useWallet from '@/services/wallets/useWallet'
import useSafeInfo from '@/services/useSafeInfo'
import ConfirmTxModal from '@/components/tx/modals/ConfirmTxModal'

const SignTxButton = ({ txSummary }: { txSummary: TransactionSummary }): ReactElement => {
  const [open, setOpen] = useState<boolean>(false)
  const { safe } = useSafeInfo()
  const wallet = useWallet()
  const signaturePending = isSignableBy(txSummary, wallet?.address || '')
  const granted = isOwner(safe?.owners, wallet?.address)

  const onClick = () => {
    setOpen(true)
  }

  const isDisabled = !signaturePending || !granted

  return (
    <div className={css.container}>
      <Tooltip title="Sign" arrow placement="top">
        <span>
          <IconButton onClick={onClick} disabled={isDisabled}>
            <CheckIcon />
          </IconButton>
        </span>
      </Tooltip>

      {open && <ConfirmTxModal onClose={() => setOpen(false)} initialData={[txSummary]} />}
    </div>
  )
}

export default SignTxButton
