import Box from '@mui/material/Box'
import List from '@mui/material/List'
import Typography from '@mui/material/Typography'
import type { ReactElement } from 'react'

import NotificationCenterItem from '@/components/notification-center/NotificationCenterItem'
import NoNotificationsIcon from '@/public/images/notifications/no-notifications.svg'
import type { NotificationState } from '@/store/notificationsSlice'

import css from './styles.module.css'

type NotificationCenterListProps = {
  notifications: NotificationState
  handleClose: () => void
}

const NotificationCenterList = ({ notifications, handleClose }: NotificationCenterListProps): ReactElement => {
  if (!notifications.length) {
    return (
      <div data-sid="48128" className={css.wrapper}>
        <NoNotificationsIcon alt="No notifications" />
        <Typography paddingTop="8px">No notifications</Typography>
      </div>
    )
  }

  return (
    <Box data-sid="99837" className={css.scrollContainer}>
      <List sx={{ p: 0 }}>
        {notifications.map((notification) => (
          <NotificationCenterItem key={notification.id} {...notification} handleClose={handleClose} />
        ))}
      </List>
    </Box>
  )
}

export default NotificationCenterList
