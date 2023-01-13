import React, { type ReactElement } from 'react'
import { Grid, Typography } from '@mui/material'

const ReviewRow = ({ name, value }: { name: string; value: ReactElement }) => {
  return (
    <>
      <Grid item xs={3}>
        <Typography variant="body2">{name}</Typography>
      </Grid>
      <Grid item xs={9}>
        {value}
      </Grid>
    </>
  )
}

export default ReviewRow
