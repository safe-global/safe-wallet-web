import { useState } from 'react'
import { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import { useRouter } from 'next/router'
import { Button, Box } from '@mui/material'
import { AddCustomAppModal } from '@/components/safe-apps/AddCustomAppModal'
import { AppCardContainer } from './AppCard'
import { IS_PRODUCTION, SAFE_REACT_URL } from '@/config/constants'

type Props = { onSave: (data: SafeAppData) => void; safeAppList: SafeAppData[] }

const AddCustomAppCard = ({ onSave, safeAppList }: Props) => {
  const [addCustomAppModalOpen, setAddCustomAppModalOpen] = useState(false)
  const router = useRouter()
  const url = `${SAFE_REACT_URL}/${router.query.safe}/apps`

  return (
    <>
      <AppCardContainer url={IS_PRODUCTION ? url : undefined}>
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
            onClick={() => {
              if (!IS_PRODUCTION) {
                setAddCustomAppModalOpen(true)
              }
            }}
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
