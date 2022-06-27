import React, { useState, type ReactElement } from 'react'
import { type TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { Tooltip } from '@mui/material'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import IconButton from '@mui/material/IconButton'

import css from './styles.module.css'
import useSafeInfo from '@/hooks/useSafeInfo'
import { isMultisigExecutionInfo } from '@/utils/transaction-guards'
import ExecuteTxModal from '@/components/tx/modals/ExecuteTxModal'
import useIsPending from '@/hooks/useIsPending'

const ExecuteTxButton = ({ txSummary }: { txSummary: TransactionSummary }): ReactElement => {
  const [open, setOpen] = useState<boolean>(false)
  const { safe } = useSafeInfo()
  const safeNonce = safe?.nonce
  const txNonce = isMultisigExecutionInfo(txSummary.executionInfo) ? txSummary.executionInfo.nonce : undefined
  const isPending = useIsPending({ txId: txSummary.id })

  const isNext = !!txNonce && !!safeNonce && txNonce === safeNonce
  const isDisabled = !isNext || isPending

  const onClick = () => {
    setOpen(true)
  }

  return (
    <div className={css.container}>
      <Tooltip title="Execute" arrow placement="top">
        <span>
          <IconButton onClick={onClick} disabled={isDisabled} color="primary">
            <RocketLaunchIcon />
          </IconButton>
        </span>
      </Tooltip>

      {open && <ExecuteTxModal onClose={() => setOpen(false)} initialData={[txSummary]} />}
    </div>
  )
}

export default ExecuteTxButton
