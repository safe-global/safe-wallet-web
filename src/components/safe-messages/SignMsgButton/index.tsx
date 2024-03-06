import { Button, Tooltip } from '@mui/material'
import type { SafeMessage } from '@safe-global/safe-gateway-typescript-sdk'
import type { ReactElement, SyntheticEvent } from 'react'
import { useContext } from 'react'

import CheckWallet from '@/components/common/CheckWallet'
import Track from '@/components/common/Track'
import { TxModalContext } from '@/components/tx-flow'
import { SignMessageFlow } from '@/components/tx-flow/flows'
import useIsSafeMessageSignableBy from '@/hooks/messages/useIsSafeMessageSignableBy'
import useWallet from '@/hooks/wallets/useWallet'
import { MESSAGE_EVENTS } from '@/services/analytics/events/txList'

const SignMsgButton = ({ msg, compact = false }: { msg: SafeMessage; compact?: boolean }): ReactElement => {
  const wallet = useWallet()
  const isSignable = useIsSafeMessageSignableBy(msg, wallet?.address || '')
  const { setTxFlow } = useContext(TxModalContext)

  const onClick = (e: SyntheticEvent) => {
    e.stopPropagation()
    setTxFlow(<SignMessageFlow {...msg} />)
  }

  return (
    <CheckWallet>
      {(isOk) => (
        <Tooltip title={isOk && !isSignable ? "You've already signed this message" : ''}>
          <span>
            <Track {...MESSAGE_EVENTS.SIGN}>
              <Button
                data-sid="79350"
                onClick={onClick}
                variant={isSignable ? 'contained' : 'outlined'}
                disabled={!isOk || !isSignable}
                size={compact ? 'small' : 'stretched'}
                sx={compact ? { py: 0.8 } : undefined}
              >
                Sign
              </Button>
            </Track>
          </span>
        </Tooltip>
      )}
    </CheckWallet>
  )
}

export default SignMsgButton
