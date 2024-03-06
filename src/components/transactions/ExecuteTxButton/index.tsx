import { Button, Tooltip } from '@mui/material'
import { type TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import type { SyntheticEvent } from 'react'
import { useContext, type ReactElement } from 'react'

import CheckWallet from '@/components/common/CheckWallet'
import Track from '@/components/common/Track'
import { TxModalContext } from '@/components/tx-flow'
import { ConfirmTxFlow } from '@/components/tx-flow/flows'
import { useSafeSDK } from '@/hooks/coreSDK/safeCoreSDK'
import useSafeInfo from '@/hooks/useSafeInfo'
import { TX_LIST_EVENTS } from '@/services/analytics/events/txList'
import { isMultisigExecutionInfo } from '@/utils/transaction-guards'
import { ReplaceTxHoverContext } from '../GroupedTxListItems/ReplaceTxHoverProvider'

const ExecuteTxButton = ({
  txSummary,
  compact = false,
}: {
  txSummary: TransactionSummary
  compact?: boolean
}): ReactElement => {
  const { setTxFlow } = useContext(TxModalContext)
  const { safe } = useSafeInfo()
  const txNonce = isMultisigExecutionInfo(txSummary.executionInfo) ? txSummary.executionInfo.nonce : undefined
  const { setSelectedTxId } = useContext(ReplaceTxHoverContext)
  const safeSDK = useSafeSDK()

  const isNext = txNonce !== undefined && txNonce === safe.nonce
  const isDisabled = !isNext || !safeSDK

  const onClick = (e: SyntheticEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setTxFlow(<ConfirmTxFlow txSummary={txSummary} />, undefined, false)
  }

  const onMouseEnter = () => {
    setSelectedTxId(txSummary.id)
  }

  const onMouseLeave = () => {
    setSelectedTxId(undefined)
  }

  return (
    <>
      <CheckWallet allowNonOwner>
        {(isOk) => (
          <Tooltip title={isOk && !isNext ? 'You must execute the transaction with the lowest nonce first' : ''}>
            <span>
              <Track {...TX_LIST_EVENTS.EXECUTE}>
                <Button
                  data-sid="92571"
                  onClick={onClick}
                  onMouseEnter={onMouseEnter}
                  onMouseLeave={onMouseLeave}
                  variant="contained"
                  disabled={!isOk || isDisabled}
                  size={compact ? 'small' : 'stretched'}
                  sx={{ minWidth: '106.5px', py: compact ? 0.8 : undefined }}
                >
                  Execute
                </Button>
              </Track>
            </span>
          </Tooltip>
        )}
      </CheckWallet>
    </>
  )
}

export default ExecuteTxButton
