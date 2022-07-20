import * as React from 'react'
import { Button, Paper } from '@mui/material'

type Props = {}

const AddCustomAppCard = ({}: Props) => {
  return (
    <Paper
      sx={({ palette }) => ({
        height: 190,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.3s ease-in-out, border 0.3s ease-in-out',
        border: '2px solid transparent',
        '&:hover': {
          backgroundColor: palette.primary.background,
          border: `2px solid ${palette.primary.light}`,
        },
      })}
    >
      <img src="/images/add-custom-app.svg" alt="Add custom app icon" />
      <Button
        variant="contained"
        size="small"
        sx={{
          mt: 1,
        }}
      >
        Add custom app
      </Button>
    </Paper>
  )
}

export { AddCustomAppCard }
