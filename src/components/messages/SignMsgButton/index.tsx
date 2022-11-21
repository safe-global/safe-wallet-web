import { Button, Tooltip, IconButton } from '@mui/material'
import type { SyntheticEvent } from 'react'
import type { ReactElement } from 'react'
import CheckIcon from '@mui/icons-material/Check'

import useWallet from '@/hooks/wallets/useWallet'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import Track from '@/components/common/Track'
import { MESSAGE_EVENTS } from '@/services/analytics/events/txList'
import useIsMessageSignableBy from '@/hooks/useIsMsgSignableBy'
import useIsMsgPending from '@/hooks/useIsMsgPending'
import type { Message } from '@/hooks/useMessages'

const SignMsgButton = ({ msg, compact = false }: { msg: Message; compact?: boolean }): ReactElement => {
  const wallet = useWallet()
  const isSignable = useIsMessageSignableBy(msg, wallet?.address || '')
  const isSafeOwner = useIsSafeOwner()
  const isPending = useIsMsgPending(msg.messageHash)

  const onClick = (e: SyntheticEvent) => {
    e.stopPropagation()
    // TODO: Open modal
  }

  const isDisabled = !isSignable || !isSafeOwner || isPending

  return (
    <>
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
    </>
  )
}

export default SignMsgButton
