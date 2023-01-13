import type { TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import { Button, Tooltip, SvgIcon } from '@mui/material'

import type { SyntheticEvent, ReactElement } from 'react'
import { useState, Suspense } from 'react'
import { isMultisigExecutionInfo } from '@/utils/transaction-guards'
import dynamic from 'next/dynamic'
import useIsPending from '@/hooks/useIsPending'
import IconButton from '@mui/material/IconButton'
import ErrorIcon from '@/public/images/notifications/error.svg'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import Track from '@/components/common/Track'
import { TX_LIST_EVENTS } from '@/services/analytics/events/txList'

const NewTxModal = dynamic(() => import('@/components/tx/modals/NewTxModal'))

const RejectTxButton = ({
  txSummary,
  compact = false,
}: {
  txSummary: TransactionSummary
  compact?: boolean
}): ReactElement | null => {
  const [open, setOpen] = useState<boolean>(false)
  const isSafeOwner = useIsSafeOwner()
  const txNonce = isMultisigExecutionInfo(txSummary.executionInfo) ? txSummary.executionInfo.nonce : undefined
  const isPending = useIsPending(txSummary.id)

  const isDisabled = isPending || !isSafeOwner

  const onClick = (e: SyntheticEvent) => {
    e.stopPropagation()
    setOpen(true)
  }

  return (
    <>
      <Track {...TX_LIST_EVENTS.REJECT}>
        {compact ? (
          <Tooltip title="Replace" arrow placement="top">
            <span>
              <IconButton onClick={onClick} color="error" size="small" disabled={isDisabled}>
                <SvgIcon component={ErrorIcon} inheritViewBox fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        ) : (
          <Button onClick={onClick} variant="danger" disabled={isDisabled} size="stretched">
            Replace
          </Button>
        )}
      </Track>

      {open && (
        <Suspense>
          <NewTxModal onClose={() => setOpen(false)} txNonce={txNonce} />
        </Suspense>
      )}
    </>
  )
}

export default RejectTxButton
