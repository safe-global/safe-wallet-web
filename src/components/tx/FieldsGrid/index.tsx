import { type ReactNode } from 'react'
import { Grid, Typography } from '@mui/material'

const width = { xl: '25%', lg: '200px', xs: 'auto' }
const minWidth = { xl: '25%', lg: '200px' }
const wrap = { flexWrap: { xl: 'nowrap' } }

const FieldsGrid = ({ title, children }: { title: string | ReactNode; children: ReactNode }) => {
  return (
    <Grid container alignItems="center" gap={1} sx={wrap}>
      <Grid item data-testid="tx-row-title" width={width} minWidth={minWidth} style={{ wordBreak: 'break-word' }}>
        <Typography color="primary.light">{title}</Typography>
      </Grid>

      <Grid item xs data-testid="tx-data-row">
        {children}
      </Grid>
    </Grid>
  )
}

export default FieldsGrid
