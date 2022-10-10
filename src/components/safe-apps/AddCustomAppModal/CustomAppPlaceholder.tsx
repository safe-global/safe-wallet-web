import { SvgIcon, Typography } from '@mui/material'

import SafeAppIcon from '@/public/images/apps/apps-icon.svg'

import css from './styles.module.css'

type CustomAppPlaceholderProps = {
  error?: string
}

const CustomAppPlaceholder = ({ error = '' }: CustomAppPlaceholderProps) => {
  return (
    <div className={css.customAppPlaceholderContainer}>
      <SvgIcon
        className={css.customAppPlaceholderIcon}
        error={error ? 'error' : 'inherit'}
        component={SafeAppIcon}
        inheritViewBox
      />
      <Typography ml={2} color={error ? 'error' : 'border.main'}>
        {error || 'App card'}
      </Typography>
    </div>
  )
}

export default CustomAppPlaceholder
