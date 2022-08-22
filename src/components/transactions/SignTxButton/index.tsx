import { useState, type ReactElement, SyntheticEvent, useEffect } from 'react'
import { type TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { Button, CircularProgress, Tooltip } from '@mui/material'

import { isSignableBy } from '@/utils/transaction-guards'
import useWallet from '@/hooks/wallets/useWallet'
import ConfirmTxModal from '@/components/tx/modals/ConfirmTxModal'
import useIsPending from '@/hooks/useIsPending'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import IconButton from '@mui/material/IconButton'
import CheckIcon from '@mui/icons-material/Check'
import Track from '@/components/common/Track'
import { TX_LIST_EVENTS } from '@/services/analytics/events/txList'
import { txSubscribe, TxEvent } from '@/services/tx/txEvents'

const useIsSignatureProposalPending = (txSummary: TransactionSummary) => {
  const wallet = useWallet()
  const isSignable = isSignableBy(txSummary, wallet?.address || '')
  const [isSignatureProposalPending, setIsSignatureProposalPending] = useState<boolean>(false)

  useEffect(() => {
    if (isSignable) {
      setIsSignatureProposalPending(false)
    }
  }, [isSignable])

  useEffect(() => {
    return txSubscribe(TxEvent.SIGNATURE_PROPOSED, ({ txId }) => {
      if (txSummary.id === txId) {
        setIsSignatureProposalPending(true)
      }
    })
  }, [])

  return isSignatureProposalPending
}

const CONFIRM_TEXT = 'Confirm'

const SignTxButton = ({
  txSummary,
  compact = false,
}: {
  txSummary: TransactionSummary
  compact?: boolean
}): ReactElement => {
  const [open, setOpen] = useState<boolean>(false)
  const wallet = useWallet()
  const isSignable = isSignableBy(txSummary, wallet?.address || '')
  const isSafeOwner = useIsSafeOwner()
  const isPending = useIsPending(txSummary.id)
  const isSignatureProposalPending = useIsSignatureProposalPending(txSummary)

  const onClick = (e: SyntheticEvent) => {
    e.stopPropagation()
    setOpen(true)
  }

  const isDisabled = !isSignable || !isSafeOwner || isPending || isSignatureProposalPending

  return (
    <>
      <Track {...TX_LIST_EVENTS.CONFIRM}>
        {compact ? (
          <Tooltip title={CONFIRM_TEXT} arrow placement="top">
            <span>
              <IconButton onClick={onClick} color="primary" disabled={isDisabled} size="small">
                {isSignatureProposalPending ? <CircularProgress size={14} /> : <CheckIcon fontSize="small" />}
              </IconButton>
            </span>
          </Tooltip>
        ) : (
          <Button onClick={onClick} variant="contained" disabled={isDisabled} size="stretched">
            {CONFIRM_TEXT}
          </Button>
        )}
      </Track>

      {open && <ConfirmTxModal onClose={() => setOpen(false)} initialData={[txSummary]} />}
    </>
  )
}

export default SignTxButton
