import { useState } from 'react'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import type { SafeAppData } from '@safe-global/safe-gateway-typescript-sdk'

import AddCustomAppIcon from '@/public/images/apps/add-custom-app.svg'
import { AddCustomAppModal } from '@/components/safe-apps/AddCustomAppModal'
import Stack from '@mui/material/Stack'

type Props = { onSave: (data: SafeAppData) => void; safeAppList: SafeAppData[] }

const AddCustomSafeAppCard = ({ onSave, safeAppList }: Props) => {
  const [addCustomAppModalOpen, setAddCustomAppModalOpen] = useState<boolean>(false)

  return (
    <>
      <Card>
        <Stack p="48px 12px" alignItems="center">
          {/* Add Custom Safe App Icon */}
          <AddCustomAppIcon alt="Add Custom Safe App card" />

          {/*  Add Custom Safe App Button */}
          <Button
            variant="contained"
            size="small"
            onClick={() => setAddCustomAppModalOpen(true)}
            sx={{
              mt: 3,
            }}
          >
            Add custom Safe App
          </Button>
        </Stack>
      </Card>

      {/*  Add Custom Safe App Modal */}
      <AddCustomAppModal
        open={addCustomAppModalOpen}
        onClose={() => setAddCustomAppModalOpen(false)}
        onSave={onSave}
        safeAppsList={safeAppList}
      />
    </>
  )
}

export default AddCustomSafeAppCard
