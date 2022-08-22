import { Box, Button, DialogContent, Grid, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material'
import { useState } from 'react'

import TxModal from '@/components/tx/TxModal'
import useSafeInfo from '@/hooks/useSafeInfo'

import { createUpdateThresholdTx } from '@/services/tx/txSender'
import useAsync from '@/hooks/useAsync'

import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import Track from '@/components/common/Track'
import { SETTINGS_EVENTS } from '@/services/analytics/events/settings'
import { trackEvent } from '@/services/analytics/analytics'

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
      <div>
        <Track {...SETTINGS_EVENTS.SETUP.CHANGE_THRESHOLD}>
          <Button onClick={() => setOpen(true)} variant="contained">
            Change
          </Button>
        </Track>
      </div>
      {open && <TxModal onClose={handleClose} steps={ChangeThresholdSteps} initialData={[initialModalData]} />}
    </Box>
  )
}

const ChangeThresholdStep = ({ data, onSubmit }: { data: ChangeThresholdData; onSubmit: (data: null) => void }) => {
  const { safe } = useSafeInfo()
  const [selectedThreshold, setSelectedThreshold] = useState<number>()

  const handleChange = (event: SelectChangeEvent<number>) => {
    const newThreshold = parseInt(event.target.value.toString())
    setSelectedThreshold(newThreshold === data.threshold ? undefined : newThreshold)
  }

  const [safeTx, safeTxError] = useAsync<SafeTransaction>(() => {
    if (!selectedThreshold) return
    return createUpdateThresholdTx(selectedThreshold)
  }, [selectedThreshold])

  const onChangeTheshold = (data: null) => {
    trackEvent({ ...SETTINGS_EVENTS.SETUP.OWNERS, label: safe.owners.length })
    trackEvent({ ...SETTINGS_EVENTS.SETUP.THRESHOLD, label: selectedThreshold })

    onSubmit(data)
  }

  return (
    <>
      <DialogContent sx={{ marginTop: 4 }}>
        <Typography mb={2}>Any transaction will require the confirmation of:</Typography>

        <Grid container direction="row" gap={1} alignItems="center" mb={2}>
          <Grid item xs={2}>
            <Select value={selectedThreshold ?? data.threshold} onChange={handleChange} fullWidth>
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

        {!selectedThreshold && (
          <Typography mb={2}>
            Current policy is{' '}
            <b>
              {data.threshold} out of {safe.owners.length}
            </b>
            .
          </Typography>
        )}
      </DialogContent>

      {selectedThreshold && (
        <Box mt={-5}>
          <SignOrExecuteForm
            safeTx={safeTx}
            isExecutable={safe.threshold === 1}
            onSubmit={onChangeTheshold}
            error={safeTxError}
          />
        </Box>
      )}
    </>
  )
}
