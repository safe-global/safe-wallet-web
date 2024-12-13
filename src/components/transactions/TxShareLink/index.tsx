import type { ReactElement } from 'react'
import { useEffect, useState } from 'react'
import { IconButton, Link, SvgIcon } from '@mui/material'
import ShareIcon from '@/public/images/common/share.svg'
import { AppRoutes } from '@/config/routes'
import { useRouter } from 'next/router'
import Track from '@/components/common/Track'
import { TX_LIST_EVENTS } from '@/services/analytics/events/txList'
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

const TxShareLink = ({ id }: { id: string }): ReactElement => {
  const router = useRouter()
  const { safe = '' } = router.query
  const href = `${AppRoutes.transactions.tx}?safe=${safe}&id=${id}`
  const txUrl = useOrigin() + href

  return (
    <Track {...TX_LIST_EVENTS.COPY_DEEPLINK}>
      <CopyTooltip text={txUrl} initialToolTipText="Copy the transaction URL">
        <IconButton data-testid="share-btn" component={Link} aria-label="Share">
          <SvgIcon component={ShareIcon} inheritViewBox fontSize="small" color="border" />
        </IconButton>
      </CopyTooltip>
    </Track>
  )
}

export default TxShareLink
