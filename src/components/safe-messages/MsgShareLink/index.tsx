import type { ReactElement } from 'react'
import { useEffect, useState } from 'react'
import { Box, IconButton, Link, SvgIcon, Typography } from '@mui/material'
import ShareIcon from '@/public/images/common/share.svg'
import { AppRoutes } from '@/config/routes'
import { useRouter } from 'next/router'
import Track from '@/components/common/Track'
import { MESSAGE_EVENTS } from '@/services/analytics/events/txList'
import React from 'react'
import CopyTooltip from '@/components/common/CopyTooltip'

const useOrigin = () => {
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    if (typeof location !== 'undefined') {
      setOrigin(location.origin)
    }
  }, [])
  return origin
}

const MsgShareLink = ({ safeMessageHash, linkText }: { safeMessageHash: string; linkText?: string }): ReactElement => {
  const router = useRouter()
  const { safe = '' } = router.query
  const href = `${AppRoutes.transactions.msg}?safe=${safe}&messageHash=${safeMessageHash}`
  const txUrl = useOrigin() + href

  return (
    <Track {...MESSAGE_EVENTS.COPY_DEEPLINK}>
      <CopyTooltip text={txUrl} initialToolTipText="Copy the message URL">
        {linkText ? (
          <Link component="button" data-testid="share-btn" aria-label="Share">
            <Box display="inline-flex" alignItems="center" alignContent="center" mx="4px">
              <SvgIcon component={ShareIcon} inheritViewBox fontSize="small" color="border" />
              <Typography display="inline" mx="4px" sx={{ textDecoration: 'underline' }}>
                {linkText}
              </Typography>
            </Box>
          </Link>
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
