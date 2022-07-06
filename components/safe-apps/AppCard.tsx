import * as React from 'react'
import Avatar from '@mui/material/Avatar'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material'
import { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'

type Props = {
  safeApp: SafeAppData
}

const AppCard = ({ safeApp }: Props) => {
  const theme = useTheme()

  return (
    <Card
      sx={{
        maxWidth: 345,
        height: 190,
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          backgroundColor: theme.palette.primaryGreen[200],
          // @ts-expect-error type '300' can't be used to index type 'PaletteColor'
          border: `2px solid ${theme.palette.primary[300]}`,
        },
      }}
    >
      <CardHeader
        avatar={
          <Avatar src={safeApp.iconUrl} alt={`${safeApp.name} logo`} variant="square" sx={{ objectFit: 'contain' }} />
        }
        action={
          <>
            <IconButton aria-label={`Share ${safeApp.name}`} size="small">
              <img width={theme.spacing(2)} src="/images/share.svg" alt="Share icon" />
            </IconButton>
            <IconButton aria-label={`Delete ${safeApp.name}`} size="small">
              <img width={theme.spacing(2)} src="/images/delete.svg" alt="Delete icon" />
            </IconButton>
          </>
        }
      />
      <CardContent sx={{ paddingTop: 0 }}>
        <Typography gutterBottom variant="h5">
          {safeApp.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {safeApp.description}
        </Typography>
      </CardContent>
    </Card>
  )
}

export { AppCard }
