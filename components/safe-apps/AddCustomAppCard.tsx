import * as React from 'react'
import Avatar from '@mui/material/Avatar'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material'

type Props = {}

const AddCustomAppCard = ({}: Props) => {
  const theme = useTheme()

  return (
    <Card
      sx={({ palette }) => ({
        maxWidth: 260,
        height: 190,
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          backgroundColor: palette.primary.background,
          border: `2px solid ${palette.primary.light}`,
        },
      })}
    >
      <CardHeader avatar={<Avatar alt="logo" variant="square" sx={{ objectFit: 'contain' }} />} />
      <CardContent sx={{ paddingTop: 0 }}>
        <Typography gutterBottom variant="h5">
          test
        </Typography>
      </CardContent>
    </Card>
  )
}

export { AddCustomAppCard }
