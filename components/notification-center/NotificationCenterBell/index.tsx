import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import { ButtonBase } from '@mui/material'
import type { ReactElement } from 'react'

import css from './styles.module.css'

const NotificationCenterBell = (): ReactElement => {
  return (
    <ButtonBase disableRipple className={css.button}>
      <NotificationsNoneOutlinedIcon sx={({ palette }) => ({ color: palette.secondary.light })} />
    </ButtonBase>
  )
}

export default NotificationCenterBell
