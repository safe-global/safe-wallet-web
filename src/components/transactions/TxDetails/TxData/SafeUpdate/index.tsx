import { Stack } from '@mui/material'
import type { TransactionData } from '@safe-global/safe-gateway-typescript-sdk'
import UpdateSafe from '@/components/tx/confirmation-views/UpdateSafe'
import DecodedData from '../DecodedData'

function SafeUpdate({ txData }: { txData?: TransactionData }) {
  return (
    <Stack mr={5} spacing={2}>
      <UpdateSafe />

      <DecodedData txData={txData} toInfo={txData?.to} />
    </Stack>
  )
}

export default SafeUpdate
