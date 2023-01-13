import { useState } from 'react'
import type { SafeAppData } from '@safe-global/safe-gateway-typescript-sdk'
import { Button, Box } from '@mui/material'
import { AddCustomAppModal } from '@/components/safe-apps/AddCustomAppModal'
import { AppCardContainer } from './AppCard'
import AddCustomAppIcon from '@/public/images/apps/add-custom-app.svg'

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
          <AddCustomAppIcon />
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
