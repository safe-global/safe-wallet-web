import { SvgIcon, Typography } from '@mui/material'
import classNames from 'classnames'

import SafeAppIcon from '@/public/images/apps/apps-icon.svg'

import css from './styles.module.css'

type CustomAppPlaceholderProps = {
  error?: string
}

const CustomAppPlaceholder = ({ error = '' }: CustomAppPlaceholderProps) => {
  return (
    <div className={css.customAppPlaceholderContainer}>
      <SvgIcon
        className={classNames({
          [css.customAppPlaceholderIconError]: error,
          [css.customAppPlaceholderIconDefault]: !error,
        })}
        component={SafeAppIcon}
        inheritViewBox
      />
      <Typography ml={2} color={error ? 'error' : 'text.secondary'}>
        {error || 'App card'}
      </Typography>
    </div>
  )
}

export default CustomAppPlaceholder
