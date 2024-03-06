import { Button, Tooltip } from '@mui/material'
import { type TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import type { SyntheticEvent } from 'react'
import { useContext, type ReactElement } from 'react'

import CheckWallet from '@/components/common/CheckWallet'
import Track from '@/components/common/Track'
import { TxModalContext } from '@/components/tx-flow'
import { ConfirmTxFlow } from '@/components/tx-flow/flows'
import { useSafeSDK } from '@/hooks/coreSDK/safeCoreSDK'
import useWallet from '@/hooks/wallets/useWallet'
import { TX_LIST_EVENTS } from '@/services/analytics/events/txList'
import { isSignableBy } from '@/utils/transaction-guards'

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
  const safeSDK = useSafeSDK()
  const isDisabled = !isSignable || !safeSDK

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
                data-sid="38786"
                onClick={onClick}
                variant={compact ? 'outlined' : 'contained'}
                disabled={!isOk || isDisabled}
                size={compact ? 'small' : 'stretched'}
                sx={compact ? { py: 0.6 } : undefined}
              >
                Confirm
              </Button>
            </Track>
          </span>
        </Tooltip>
      )}
    </CheckWallet>
  )
}

export default SignTxButton
