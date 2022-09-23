import { Box, Typography } from '@mui/material'
import type { ReactElement } from 'react'

import css from './styles.module.css'

const PageHeader = ({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle: string
  action?: ReactElement
}): ReactElement => {
  return (
    <Box
      className={css.container}
      sx={{
        // Doesn't work in module
        position: 'sticky',
        top: -96,
      }}
    >
      <div>
        <Typography variant="h3" fontWeight={700} gutterBottom>
          {title}
        </Typography>
        <Typography variant="h5" fontWeight={400} color="primary.light">
          {subtitle}
        </Typography>
      </div>
      {action}
    </Box>
  )
}

export default PageHeader
