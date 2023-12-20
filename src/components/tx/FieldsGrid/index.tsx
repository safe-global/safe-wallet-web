import { type ReactNode } from 'react'
import { Grid, Typography } from '@mui/material'

const FieldsGrid = ({ title, children }: { title: string; children: ReactNode }) => {
  return (
    <Grid container alignItems="center" gap={1}>
      <Grid item xs={1} xl={2} minWidth={90}>
        <Typography variant="body2" color="text.secondary" noWrap>
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
