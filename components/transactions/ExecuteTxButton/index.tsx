import { useState, type ReactElement, SyntheticEvent } from 'react'
import { type TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { Button, Tooltip } from '@mui/material'

import useSafeInfo from '@/hooks/useSafeInfo'
import { isMultisigExecutionInfo } from '@/utils/transaction-guards'
import ExecuteTxModal from '@/components/tx/modals/ExecuteTxModal'
import useIsPending from '@/hooks/useIsPending'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import IconButton from '@mui/material/IconButton'

const ExecuteTxButton = ({
  txSummary,
  compact = false,
}: {
  txSummary: TransactionSummary
  compact?: boolean
}): ReactElement => {
  const [open, setOpen] = useState<boolean>(false)
  const { safe } = useSafeInfo()
  const txNonce = isMultisigExecutionInfo(txSummary.executionInfo) ? txSummary.executionInfo.nonce : undefined
  const isPending = useIsPending(txSummary.id)

  const isNext = !!txNonce && !!safe.nonce && txNonce === safe.nonce
  const isDisabled = !isNext || isPending

  const onClick = (e: SyntheticEvent) => {
    e.stopPropagation()
    setOpen(true)
  }

  return (
    <>
      {compact ? (
        <Tooltip title="Execute" arrow placement="top">
          <IconButton onClick={onClick} color="primary" disabled={isDisabled} size="small">
            <RocketLaunchIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ) : (
        <Button onClick={onClick} variant="contained" disabled={isDisabled}>
          Execute
        </Button>
      )}

      {open && <ExecuteTxModal onClose={() => setOpen(false)} initialData={[txSummary]} />}
    </>
  )
}

export default ExecuteTxButton
