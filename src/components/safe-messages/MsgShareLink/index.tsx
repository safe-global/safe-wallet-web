import type { ReactElement } from 'react'
import { Button, IconButton, Link, SvgIcon } from '@mui/material'
import ShareIcon from '@/public/images/common/share.svg'
import { AppRoutes } from '@/config/routes'
import { useRouter } from 'next/router'
import Track from '@/components/common/Track'
import { MESSAGE_EVENTS } from '@/services/analytics/events/txList'
import React from 'react'
import CopyTooltip from '@/components/common/CopyTooltip'
import useOrigin from '@/hooks/useOrigin'

const MsgShareLink = ({ safeMessageHash, button }: { safeMessageHash: string; button?: boolean }): ReactElement => {
  const router = useRouter()
  const { safe = '' } = router.query
  const href = `${AppRoutes.transactions.msg}?safe=${safe}&messageHash=${safeMessageHash}`
  const txUrl = useOrigin() + href

  return (
    <Track {...MESSAGE_EVENTS.COPY_DEEPLINK}>
      <CopyTooltip text={txUrl} initialToolTipText="Copy the message URL">
        {button ? (
          <Button data-testid="share-btn" aria-label="Share" variant="contained" size="small" onClick={() => {}}>
            Copy link
          </Button>
        ) : (
          <IconButton data-testid="share-btn" component={Link} aria-label="Share">
            <SvgIcon component={ShareIcon} inheritViewBox fontSize="small" color="border" />
          </IconButton>
        )}
      </CopyTooltip>
    </Track>
  )
}

export default MsgShareLink
