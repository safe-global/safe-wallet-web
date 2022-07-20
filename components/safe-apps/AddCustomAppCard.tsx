import { ReactElement } from 'react'
import { useRouter } from 'next/router'
import { SAFE_REACT_URL } from '@/config/constants'
import { Box, Button } from '@mui/material'
import { AppCardContainer } from './AppCard'

const AddCustomAppCard = (): ReactElement => {
  const router = useRouter()
  const url = `${SAFE_REACT_URL}/${router.query.safe}/apps`

  return (
    <AppCardContainer url={url}>
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
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
      </Box>
    </AppCardContainer>
  )
}

export { AddCustomAppCard }
