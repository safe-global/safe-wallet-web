import type { ComponentType } from 'react'
import { type ReactElement, type ReactNode } from 'react'
import { Typography, SvgIcon, Divider } from '@mui/material'
import InfoIcon from '@/public/images/notifications/info.svg'
import css from './styles.module.css'

const InfoBox = ({
  title,
  message,
  children,
  icon = InfoIcon,
}: {
  title: string
  message: ReactNode
  children?: ReactNode
  icon?: ComponentType
}): ReactElement => {
  return (
    <div data-testid="message-infobox" className={css.container}>
      <div className={css.message}>
        <SvgIcon component={icon} color="info" inheritViewBox fontSize="medium" />
        <div>
          <Typography variant="subtitle1" fontWeight="bold">
            {title}
          </Typography>
          <Typography variant="body2">{message}</Typography>
        </div>
      </div>
      {children && (
        <>
          <Divider className={css.divider} />
          <div>{children}</div>
        </>
      )}
    </div>
  )
}

export default InfoBox
