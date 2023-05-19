import React from 'react'
import { Tooltip, Typography, ListItem, ListItemAvatar, ListItemText } from '@mui/material'
import usePendingActions from '@/hooks/usePendingActions'
import { Avatar } from '@mui/material'
import ellipsisAddress from '@/utils/ellipsisAddress'
import { AppRoutes } from '@/config/routes'
import Link from 'next/link'

export const Notification: React.FC<{
  info: any
}> = ({ info }) => {
  const { totalQueued, totalToSign } = usePendingActions(
    info.chainId,
    info.isAdded && info.isVisible ? info.address : undefined,
  )
  const query = info.href.query

  return (
    <>
      <Link href={{ pathname: AppRoutes.transactions.queue, query: { safe: `${info.name}` } }}>
        <Tooltip
          title={
            <Typography sx={{ width: '100%' }} noWrap>
              {totalToSign ? `${totalToSign} Transactions require your signature` : `Transaction is awaiting Approval`}
            </Typography>
          }
          placement="top"
          arrow
          key={info.name}
        >
          <ListItem sx={{ display: 'flex', flexDirection: 'column' }}>
            <ListItemAvatar sx={{ minWidth: 32 }}>
              {/* {info.name ? <BadgeAvatar name={info.name} /> : <Avatar alt={info.name} />} */}
              <Avatar alt={info.name} />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography sx={{ fontSize: '14px' }} variant="body2" component="span">
                  {ellipsisAddress(info.name)}
                </Typography>
              }
            />
          </ListItem>
        </Tooltip>
      </Link>
    </>
  )
}
