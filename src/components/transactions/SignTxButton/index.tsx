import type { SyntheticEvent } from 'react'
import { useState, type ReactElement } from 'react'
import { type TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import { Button, Tooltip } from '@mui/material'

import { isSignableBy } from '@/utils/transaction-guards'
import useWallet from '@/hooks/wallets/useWallet'
import ConfirmTxModal from '@/components/tx/modals/ConfirmTxModal'
import useIsPending from '@/hooks/useIsPending'
import IconButton from '@mui/material/IconButton'
import CheckIcon from '@mui/icons-material/Check'
import Track from '@/components/common/Track'
import { TX_LIST_EVENTS } from '@/services/analytics/events/txList'
import CheckWallet from '@/components/common/CheckWallet'
import { useSafeSDK } from '@/hooks/coreSDK/safeCoreSDK'
import { getTxButtonTooltip } from '@/components/transactions/utils'

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
  const isPending = useIsPending(txSummary.id)
  const safeSDK = useSafeSDK()

  const isDisabled = !isSignable || isPending || !safeSDK

  const tooltipTitle = getTxButtonTooltip('Confirm', { hasSafeSDK: !!safeSDK })

  const onClick = (e: SyntheticEvent) => {
    e.stopPropagation()
    setOpen(true)
  }

  return (
    <>
      <CheckWallet>
        {(isOk) => (
          <Track {...TX_LIST_EVENTS.CONFIRM}>
            {compact ? (
              <Tooltip title={tooltipTitle} arrow placement="top">
                <span>
                  <IconButton onClick={onClick} color="primary" disabled={!isOk || isDisabled} size="small">
                    <CheckIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            ) : (
              <Button onClick={onClick} variant="contained" disabled={!isOk || isDisabled} size="stretched">
                Confirm
              </Button>
            )}
          </Track>
        )}
      </CheckWallet>

      {open && <ConfirmTxModal onClose={() => setOpen(false)} initialData={[txSummary]} />}
    </>
  )
}

export default SignTxButton
