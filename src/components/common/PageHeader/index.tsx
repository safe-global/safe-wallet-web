import { Box, Typography } from '@mui/material'
import type { BoxProps } from '@mui/material'
import type { ReactElement } from 'react'

import css from './styles.module.css'

const PageHeader = ({
  title,
  action,
  sx = {},
}: {
  title: string
  action?: ReactElement
  sx?: BoxProps['sx']
}): ReactElement => {
  return (
    <Box
      className={css.container}
      sx={{
        height: '88px',
        top: '-12px',
        ...sx,
      }}
    >
      <Typography variant="h3" fontWeight={700}>
        {title}
      </Typography>
      {action}
    </Box>
  )
}

export default PageHeader
