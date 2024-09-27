import { type ReactNode } from 'react'
import { Grid, Typography } from '@mui/material'

const minWidth = { xl: '25%', lg: '200px' }
const wrap = { flexWrap: { xl: 'nowrap' } }

const FieldsGrid = ({ title, children }: { title: string | ReactNode; children: ReactNode }) => {
  return (
    <Grid container alignItems="center" gap={1} sx={wrap}>
      <Grid item minWidth={minWidth} data-testid="tx-row-title">
        <Typography color="primary.light" noWrap>
          {title}
        </Typography>
      </Grid>

      <Grid item xs data-testid="tx-data-row">
        {children}
      </Grid>
    </Grid>
  )
}

export default FieldsGrid
