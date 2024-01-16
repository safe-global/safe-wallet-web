import type { SyntheticEvent } from 'react'
import { useContext, type ReactElement } from 'react'
import { type TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import { Button, CircularProgress, Tooltip } from '@mui/material'

import { isSignableBy } from '@/utils/transaction-guards'
import useWallet from '@/hooks/wallets/useWallet'
import useIsPending from '@/hooks/useIsPending'
import Track from '@/components/common/Track'
import { TX_LIST_EVENTS } from '@/services/analytics/events/txList'
import CheckWallet from '@/components/common/CheckWallet'
import { useSafeSDK } from '@/hooks/coreSDK/safeCoreSDK'
import { TxModalContext } from '@/components/tx-flow'
import { ConfirmTxFlow } from '@/components/tx-flow/flows'

const SignTxButton = ({
  txSummary,
  compact = false,
}: {
  txSummary: TransactionSummary
  compact?: boolean
}): ReactElement => {
  const { setTxFlow } = useContext(TxModalContext)
  const wallet = useWallet()
  const isSignable = isSignableBy(txSummary, wallet?.address || '')
  const isPending = useIsPending(txSummary.id)
  const safeSDK = useSafeSDK()
  const isDisabled = !isSignable || isPending || !safeSDK

  const onClick = (e: SyntheticEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setTxFlow(<ConfirmTxFlow txSummary={txSummary} />, undefined, false)
  }

  return (
    <CheckWallet>
      {(isOk) => (
        <Tooltip title={isOk && !isSignable ? "You've already signed this transaction" : ''}>
          <span>
            <Track {...TX_LIST_EVENTS.CONFIRM}>
              <Button
                onClick={onClick}
                variant={compact ? 'outlined' : 'contained'}
                disabled={!isOk || isDisabled}
                size={compact ? 'small' : 'stretched'}
                sx={compact ? { py: 0.75 } : undefined}
              >
                {isPending && <CircularProgress size={14} color="inherit" sx={{ mr: 1 }} />}
                {isPending ? 'Signing' : 'Confirm'}
              </Button>
            </Track>
          </span>
        </Tooltip>
      )}
    </CheckWallet>
  )
}

export default SignTxButton
