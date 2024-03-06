import CheckIcon from '@/public/images/common/check.svg'
import { SvgIcon, Typography } from '@mui/material'
import classNames from 'classnames'
import { type ReactElement, type ReactNode } from 'react'
import css from './styles.module.css'

const SuccessMessage = ({ children, className }: { children: ReactNode; className?: string }): ReactElement => {
  return (
    <div data-sid="96633" className={classNames(css.container, className)}>
      <div data-sid="91459" className={css.message}>
        <SvgIcon component={CheckIcon} color="success" inheritViewBox fontSize="small" />

        <Typography variant="body2" width="100%">
          {children}
        </Typography>
      </div>
    </div>
  )
}

export default SuccessMessage
