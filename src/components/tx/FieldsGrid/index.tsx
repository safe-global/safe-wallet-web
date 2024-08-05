import { type ReactNode } from 'react'
import { Grid, Typography } from '@mui/material'

const FieldsGrid = ({ title, children }: { title: string; children: ReactNode }) => {
  return (
    <Grid container alignItems="center">
      <Grid item width="25%" minWidth={90}>
        <Typography color="primary.light" noWrap>
          {title}
        </Typography>
      </Grid>

      <Grid item xs>
        {children}
      </Grid>
    </Grid>
  )
}

export default FieldsGrid
