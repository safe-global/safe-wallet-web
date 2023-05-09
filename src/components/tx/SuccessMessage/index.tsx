import { type ReactElement, type ReactNode } from 'react'
import { Typography, SvgIcon } from '@mui/material'
import classNames from 'classnames'
import SuccessIcon from '@/public/images/notifications/success.svg'
import css from './styles.module.css'

const SuccessMessage = ({ children, className }: { children: ReactNode; className?: string }): ReactElement => {
  return (
    <div className={classNames(css.container, className)}>
      <div className={css.message}>
        <SvgIcon component={SuccessIcon} color="success" inheritViewBox fontSize="small" />

        <div>
          <Typography variant="body2" component="span">
            {children}
          </Typography>
        </div>
      </div>
    </div>
  )
}

export default SuccessMessage
