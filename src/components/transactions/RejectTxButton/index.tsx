import { Button } from '@mui/material'
import type { TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'

import CheckWallet from '@/components/common/CheckWallet'
import Track from '@/components/common/Track'
import { TxModalContext } from '@/components/tx-flow'
import { ReplaceTxFlow } from '@/components/tx-flow/flows'
import { useSafeSDK } from '@/hooks/coreSDK/safeCoreSDK'
import useIsPending from '@/hooks/useIsPending'
import { TX_LIST_EVENTS } from '@/services/analytics/events/txList'
import { isMultisigExecutionInfo } from '@/utils/transaction-guards'
import type { ReactElement } from 'react'
import { useContext } from 'react'

const RejectTxButton = ({
  txSummary,
  compact = false,
}: {
  txSummary: TransactionSummary
  compact?: boolean
}): ReactElement | null => {
  const { setTxFlow } = useContext(TxModalContext)
  const txNonce = isMultisigExecutionInfo(txSummary.executionInfo) ? txSummary.executionInfo.nonce : undefined
  const isPending = useIsPending(txSummary.id)
  const safeSDK = useSafeSDK()
  const isDisabled = isPending || !safeSDK

  const openReplacementModal = () => {
    if (txNonce === undefined) return
    setTxFlow(<ReplaceTxFlow txNonce={txNonce} />, undefined, false)
  }

  return (
    <CheckWallet>
      {(isOk) => (
        <Track {...TX_LIST_EVENTS.REJECT}>
          <Button
            data-sid="65598"
            onClick={openReplacementModal}
            variant="danger"
            disabled={!isOk || isDisabled}
            size={compact ? 'small' : 'stretched'}
          >
            Replace
          </Button>
        </Track>
      )}
    </CheckWallet>
  )
}

export default RejectTxButton
