import { Box, Typography } from '@mui/material'
import type { ReactElement } from 'react'

import css from './styles.module.css'

const PageHeader = ({
  title,
  action,
  noBorder,
}: {
  title: string
  action?: ReactElement
  noBorder?: boolean
}): ReactElement => {
  return (
    <Box
      className={css.container}
      sx={{
        top: '-12px',
        borderBottom: !noBorder ? ({ palette }) => `1px solid ${palette.border.light}` : undefined,
      }}
    >
      <Typography variant="h3" fontWeight={700} gutterBottom>
        {title}
      </Typography>
      {action}
    </Box>
  )
}

export default PageHeader
