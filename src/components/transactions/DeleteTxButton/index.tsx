import type { TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { Button, Tooltip, SvgIcon } from '@mui/material'

import type { SyntheticEvent } from 'react'
import { type ReactElement } from 'react'
import useIsPending from '@/hooks/useIsPending'
import IconButton from '@mui/material/IconButton'
import ErrorIcon from '@/public/images/notifications/error.svg'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import Track from '@/components/common/Track'
import { TX_LIST_EVENTS } from '@/services/analytics/events/txList'
import { useAppDispatch } from '@/store'
import { removeDraftTx } from '@/store/draftTxsSlice'
import useChainId from '@/hooks/useChainId'

const DeleteTxButton = ({
  txSummary,
  compact = false,
}: {
  txSummary: TransactionSummary
  compact?: boolean
}): ReactElement | null => {
  const dispatch = useAppDispatch()
  const chainId = useChainId()
  const isSafeOwner = useIsSafeOwner()
  const isPending = useIsPending(txSummary.id)
  const isDisabled = isPending || !isSafeOwner

  const onClick = (e: SyntheticEvent) => {
    e.stopPropagation()
    dispatch(removeDraftTx({ txId: txSummary.id, chainId }))
  }

  return (
    <>
      <Track {...TX_LIST_EVENTS.DELETE}>
        {compact ? (
          <Tooltip title="Delete draft" arrow placement="top">
            <span>
              <IconButton onClick={onClick} color="error" size="small" disabled={isDisabled}>
                <SvgIcon component={ErrorIcon} inheritViewBox fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        ) : (
          <Button onClick={onClick} variant="danger" disabled={isDisabled} size="stretched">
            Delete
          </Button>
        )}
      </Track>
    </>
  )
}

export default DeleteTxButton
