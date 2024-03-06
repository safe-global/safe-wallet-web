import InfoIcon from '@/public/images/notifications/info.svg'
import { Divider, SvgIcon, Typography } from '@mui/material'
import classNames from 'classnames'
import { type ReactElement, type ReactNode } from 'react'
import css from './styles.module.css'

const InfoBox = ({
  title,
  message,
  children,
  className,
}: {
  title: string
  message: string
  children: ReactNode
  className?: string
}): ReactElement => {
  return (
    <div data-sid="49050" className={classNames(css.container, className)}>
      <div data-sid="84499" className={css.message}>
        <SvgIcon component={InfoIcon} color="info" inheritViewBox fontSize="medium" />
        <div>
          <Typography variant="subtitle1" fontWeight="bold">
            {title}
          </Typography>
          <Typography variant="body2">{message}</Typography>
        </div>
      </div>
      <Divider className={css.divider} />
      <div>{children}</div>
    </div>
  )
}

export default InfoBox
