import React, { type ReactElement } from 'react'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

const ReviewRow = ({ name, value }: { name?: string; value: ReactElement }) => {
  return (
    <>
      {name && (
        <Grid item xs={3}>
          <Typography variant="body2">{name}</Typography>
        </Grid>
      )}
      <Grid item xs={name ? 9 : 12}>
        {value}
      </Grid>
    </>
  )
}

export default ReviewRow
