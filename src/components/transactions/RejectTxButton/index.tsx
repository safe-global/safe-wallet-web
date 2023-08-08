import type { TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import { Button, SvgIcon, Tooltip } from '@mui/material'

import type { ReactElement } from 'react'
import { useContext } from 'react'
import { isMultisigExecutionInfo } from '@/utils/transaction-guards'
import useIsPending from '@/hooks/useIsPending'
import IconButton from '@mui/material/IconButton'
import ErrorIcon from '@/public/images/notifications/error.svg'
import Track from '@/components/common/Track'
import { TX_LIST_EVENTS } from '@/services/analytics/events/txList'
import CheckWallet from '@/components/common/CheckWallet'
import { useSafeSDK } from '@/hooks/coreSDK/safeCoreSDK'
import { getTxButtonTooltip } from '@/components/transactions/utils'
import { TxModalContext } from '@/components/tx-flow'
import ReplaceTxMenu from '@/components/tx-flow/flows/ReplaceTx'

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

  const tooltipTitle = getTxButtonTooltip('Replace', { hasSafeSDK: !!safeSDK })

  const openReplacementModal = () => {
    if (txNonce === undefined) return
    setTxFlow(<ReplaceTxMenu txNonce={txNonce} />)
  }

  return (
    <CheckWallet>
      {(isOk) => (
        <Track {...TX_LIST_EVENTS.REJECT}>
          {compact ? (
            <Tooltip title={tooltipTitle} arrow placement="top">
              <span>
                <IconButton onClick={openReplacementModal} color="error" size="small" disabled={!isOk || isDisabled}>
                  <SvgIcon component={ErrorIcon} inheritViewBox fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          ) : (
            <Button onClick={openReplacementModal} variant="danger" disabled={!isOk || isDisabled} size="stretched">
              Replace
            </Button>
          )}
        </Track>
      )}
    </CheckWallet>
  )
}

export default RejectTxButton
