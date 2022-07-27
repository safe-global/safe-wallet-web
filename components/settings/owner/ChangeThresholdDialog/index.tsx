import { Box, Button, Grid, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material'
import { useState } from 'react'

import TxModal from '@/components/tx/TxModal'
import useSafeInfo from '@/hooks/useSafeInfo'

import { useSafeSDK } from '@/hooks/coreSDK/safeCoreSDK'
import { createTx } from '@/services/tx/txSender'
import useAsync from '@/hooks/useAsync'

import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'

interface ChangeThresholdData {
  threshold: number
}

const ChangeThresholdSteps: TxStepperProps['steps'] = [
  {
    label: 'Change Threshold',
    render: (data, onSubmit) => <ChangeThresholdStep data={data as ChangeThresholdData} onSubmit={onSubmit} />,
  },
]

export const ChangeThresholdDialog = () => {
  const [open, setOpen] = useState(false)

  const { safe } = useSafeInfo()

  const handleClose = () => setOpen(false)

  const initialModalData: ChangeThresholdData = { threshold: safe.threshold || 1 }

  return (
    <Box paddingTop={2}>
      <div>
        <Button onClick={() => setOpen(true)} variant="contained">
          Change
        </Button>
      </div>
      {open && <TxModal onClose={handleClose} steps={ChangeThresholdSteps} initialData={[initialModalData]} />}
    </Box>
  )
}

const ChangeThresholdStep = ({ data, onSubmit }: { data: ChangeThresholdData; onSubmit: (data: null) => void }) => {
  const { safe } = useSafeInfo()
  const [selectedThreshold, setSelectedThreshold] = useState<number>(data.threshold ?? 1)
  const safeSDK = useSafeSDK()

  // @TODO: move to txSender, add events
  const [changeThresholdTx, createTxError] = useAsync(() => {
    if (!safeSDK) {
      throw new Error('Safe SDK not initialized')
    }
    return safeSDK.getChangeThresholdTx(selectedThreshold)
  }, [selectedThreshold])

  const handleChange = (event: SelectChangeEvent<number>) => {
    setSelectedThreshold(parseInt(event.target.value.toString()))
  }

  const [safeTx, safeTxError] = useAsync<SafeTransaction | undefined>(async () => {
    if (changeThresholdTx) {
      // Reset the nonce to fetch the recommended nonce in createTx
      return createTx({ ...changeThresholdTx.data, nonce: undefined })
    }
  }, [changeThresholdTx])

  const txError = createTxError || safeTxError

  return (
    <SignOrExecuteForm
      safeTx={safeTx}
      isExecutable={safe.threshold === 1}
      onSubmit={onSubmit}
      error={txError}
      title="Change threshold"
    >
      <Typography mb={1}>Any transaction requires the confirmation of:</Typography>

      <Grid container direction="row" gap={1} alignItems="center" mb={2}>
        <Grid item xs={2}>
          <Select value={selectedThreshold} onChange={handleChange} fullWidth>
            {safe.owners.map((_, idx) => (
              <MenuItem key={idx + 1} value={idx + 1}>
                {idx + 1}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item>
          <Typography>out of {safe.owners.length} owner(s)</Typography>
        </Grid>
      </Grid>
    </SignOrExecuteForm>
  )
}
