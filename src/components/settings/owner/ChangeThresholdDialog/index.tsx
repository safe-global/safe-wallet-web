import type { SelectChangeEvent } from '@mui/material'
import { Box, Button, DialogContent, Grid, MenuItem, Select, Typography } from '@mui/material'
import { useState } from 'react'

import TxModal from '@/components/tx/TxModal'
import useSafeInfo from '@/hooks/useSafeInfo'

import useAsync from '@/hooks/useAsync'

import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import type { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import Track from '@/components/common/Track'
import { trackEvent, SETTINGS_EVENTS } from '@/services/analytics'
import { createUpdateThresholdTx } from '@/services/tx/tx-sender'
import CheckWallet from '@/components/common/CheckWallet'

interface ChangeThresholdData {
  threshold: number
}

const ChangeThresholdSteps: TxStepperProps['steps'] = [
  {
    label: 'Change threshold',
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
      <CheckWallet>
        {(isOk) => (
          <Track {...SETTINGS_EVENTS.SETUP.CHANGE_THRESHOLD}>
            <Button onClick={() => setOpen(true)} variant="contained" disabled={!isOk}>
              Change
            </Button>
          </Track>
        )}
      </CheckWallet>

      {open && <TxModal onClose={handleClose} steps={ChangeThresholdSteps} initialData={[initialModalData]} />}
    </Box>
  )
}

const ChangeThresholdStep = ({ data, onSubmit }: { data: ChangeThresholdData; onSubmit: () => void }) => {
  const { safe } = useSafeInfo()
  const [selectedThreshold, setSelectedThreshold] = useState<number>(safe.threshold)
  const [isChanged, setChanged] = useState<boolean>(false)
  const isSameThreshold = selectedThreshold === safe.threshold

  const handleChange = (event: SelectChangeEvent<number>) => {
    const newThreshold = parseInt(event.target.value.toString())
    setSelectedThreshold(newThreshold)
    setChanged(true)
  }

  const [safeTx, safeTxError] = useAsync<SafeTransaction>(() => {
    if (!selectedThreshold) return

    return createUpdateThresholdTx(selectedThreshold)
  }, [selectedThreshold])

  const onChangeThreshold = () => {
    trackEvent({ ...SETTINGS_EVENTS.SETUP.OWNERS, label: safe.owners.length })
    trackEvent({ ...SETTINGS_EVENTS.SETUP.THRESHOLD, label: selectedThreshold })

    onSubmit()
  }

  return (
    <>
      <DialogContent sx={{ marginTop: 4 }}>
        <Typography mb={2}>Any transaction will require the confirmation of:</Typography>

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

        {isChanged && isSameThreshold ? (
          <Typography color="error" mb={2}>
            Current policy is already set to {data.threshold}
          </Typography>
        ) : (
          <Typography mb={2}>
            {isChanged ? 'Previous policy was ' : 'Current policy is '}
            <b>
              {data.threshold} out of {safe.owners.length}
            </b>
            .
          </Typography>
        )}
      </DialogContent>

      <Box mt={-5}>
        <SignOrExecuteForm
          safeTx={safeTx}
          onSubmit={onChangeThreshold}
          error={safeTxError}
          disableSubmit={isSameThreshold}
        />
      </Box>
    </>
  )
}
