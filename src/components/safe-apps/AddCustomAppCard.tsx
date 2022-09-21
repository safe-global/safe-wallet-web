import { useState } from 'react'
import { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import { Button, Box } from '@mui/material'
import { AddCustomAppModal } from '@/components/safe-apps/AddCustomAppModal'
import { AppCardContainer } from './AppCard'

type Props = { onSave: (data: SafeAppData) => void; safeAppList: SafeAppData[] }

const AddCustomAppCard = ({ onSave, safeAppList }: Props) => {
  const [addCustomAppModalOpen, setAddCustomAppModalOpen] = useState(false)

  return (
    <>
      <AppCardContainer>
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
            onClick={() => setAddCustomAppModalOpen(true)}
          >
            Add custom app
          </Button>
        </Box>
      </AppCardContainer>

      <AddCustomAppModal
        open={addCustomAppModalOpen}
        onClose={() => setAddCustomAppModalOpen(false)}
        onSave={onSave}
        safeAppsList={safeAppList}
      />
    </>
  )
}

export { AddCustomAppCard }
