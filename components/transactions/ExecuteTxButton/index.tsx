import React, { useState, type ReactElement } from 'react'
import { type TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { Button, Tooltip } from '@mui/material'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'

import css from './styles.module.css'
import useSafeInfo from '@/services/useSafeInfo'
import { isMultisigExecutionInfo, isPending } from '@/components/transactions/utils'
import ExecuteTxModal from '@/components/tx/ExecuteTxModal'

const ExecuteTxButton = ({ txSummary }: { txSummary: TransactionSummary }): ReactElement => {
  const [open, setOpen] = useState<boolean>(false)
  const { safe } = useSafeInfo()
  const safeNonce = safe?.nonce
  const txNonce = isMultisigExecutionInfo(txSummary.executionInfo) ? txSummary.executionInfo.nonce : undefined

  const isNext = !!txNonce && !!safeNonce && txNonce === safeNonce
  const isDisabled = !isNext || isPending(txSummary.txStatus)

  const onClick = () => {
    setOpen(true)
  }

  return (
    <div className={css.container}>
      <Tooltip title="Execute" arrow placement="top">
        <span>
          <Button onClick={onClick} disabled={isDisabled}>
            <RocketLaunchIcon />
          </Button>
        </span>
      </Tooltip>

      {open && <ExecuteTxModal onClose={() => setOpen(false)} initialData={[txSummary]} />}
    </div>
  )
}

export default ExecuteTxButton
