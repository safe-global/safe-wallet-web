import { Button, Tooltip, IconButton } from '@mui/material'
import { useContext } from 'react'
import CheckIcon from '@mui/icons-material/Check'
import type { SyntheticEvent, ReactElement } from 'react'
import type { SafeMessage } from '@safe-global/safe-gateway-typescript-sdk'

import useWallet from '@/hooks/wallets/useWallet'
import Track from '@/components/common/Track'
import { MESSAGE_EVENTS } from '@/services/analytics/events/txList'
import useIsSafeMessageSignableBy from '@/hooks/messages/useIsSafeMessageSignableBy'
import useIsSafeMessagePending from '@/hooks/messages/useIsSafeMessagePending'
import { TxModalContext } from '@/components/tx-flow'
import SignMessageFlow from '@/components/tx-flow/flows/SignMessage'

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
    <Track {...MESSAGE_EVENTS.SIGN}>
      {compact ? (
        <Tooltip title="Sign" arrow placement="top">
          <span>
            <IconButton onClick={onClick} color="primary" disabled={isDisabled} size="small">
              <CheckIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      ) : (
        <Button onClick={onClick} variant="contained" disabled={isDisabled} size="stretched">
          Sign
        </Button>
      )}
    </Track>
  )
}

export default SignMsgButton
