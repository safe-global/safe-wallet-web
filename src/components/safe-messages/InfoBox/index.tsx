import { type ReactElement, type ReactNode } from 'react'
import { Typography, SvgIcon, Divider } from '@mui/material'
import classNames from 'classnames'
import InfoIcon from '@/public/images/notifications/info.svg'
import css from './styles.module.css'

const InfoBox = ({
  message,
  children,
  className,
}: {
  message: string
  children: ReactNode
  className?: string
}): ReactElement => {
  return (
    <div className={classNames(css.container, className)}>
      <div className={css.message}>
        <SvgIcon component={InfoIcon} color="info" inheritViewBox fontSize="small" />
        <div>
          <Typography variant="body2" component="span">
            {message}
          </Typography>
        </div>
      </div>
      <Divider sx={{ marginRight: -2, marginLeft: -2 }} />
      <div>{children}</div>
    </div>
  )
}

export default InfoBox
