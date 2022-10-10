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
        borderBottom: noBorder ? undefined : ({ palette }) => `1px solid ${palette.border.light}`,
      }}
    >
      <Typography variant="h3" className={css.title}>
        {title}
      </Typography>
      {action}
    </Box>
  )
}

export default PageHeader
