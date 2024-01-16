import { Button, CircularProgress, Tooltip } from '@mui/material'
import { useContext } from 'react'
import type { SyntheticEvent, ReactElement } from 'react'
import type { SafeMessage } from '@safe-global/safe-gateway-typescript-sdk'

import useWallet from '@/hooks/wallets/useWallet'
import Track from '@/components/common/Track'
import { MESSAGE_EVENTS } from '@/services/analytics/events/txList'
import useIsSafeMessageSignableBy from '@/hooks/messages/useIsSafeMessageSignableBy'
import useIsSafeMessagePending from '@/hooks/messages/useIsSafeMessagePending'
import { TxModalContext } from '@/components/tx-flow'
import { SignMessageFlow } from '@/components/tx-flow/flows'
import CheckWallet from '@/components/common/CheckWallet'

const SignMsgButton = ({ msg, compact = false }: { msg: SafeMessage; compact?: boolean }): ReactElement => {
  const wallet = useWallet()
  const isSignable = useIsSafeMessageSignableBy(msg, wallet?.address || '')
  const isPending = useIsSafeMessagePending(msg.messageHash)
  const { setTxFlow } = useContext(TxModalContext)

  const onClick = (e: SyntheticEvent) => {
    e.stopPropagation()
    setTxFlow(<SignMessageFlow {...msg} />)
  }

  const isDisabled = !isSignable || isPending

  return (
    <CheckWallet>
      {(isOk) => (
        <Tooltip title={isOk && !isSignable ? "You've already signed this message" : ''}>
          <span>
            <Track {...MESSAGE_EVENTS.SIGN}>
              <Button
                onClick={onClick}
                variant={isSignable ? 'contained' : 'outlined'}
                disabled={!isOk || isDisabled}
                size={compact ? 'small' : 'stretched'}
              >
                {isPending && <CircularProgress size={14} color="inherit" sx={{ mr: 1 }} />}
                {isPending ? 'Signing' : 'Sign'}
              </Button>
            </Track>
          </span>
        </Tooltip>
      )}
    </CheckWallet>
  )
}

export default SignMsgButton
