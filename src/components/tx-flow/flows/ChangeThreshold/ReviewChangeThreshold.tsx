import useSafeInfo from '@/hooks/useSafeInfo'
import { useContext, useEffect, useState } from 'react'
import { DialogContent, Grid, MenuItem, Select, type SelectChangeEvent, Typography } from '@mui/material'
import { createUpdateThresholdTx } from '@/services/tx/tx-sender'
import { SETTINGS_EVENTS, trackEvent } from '@/services/analytics'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'

const ReviewChangeThreshold = () => {
  const { safe } = useSafeInfo()
  const [selectedThreshold, setSelectedThreshold] = useState<number>(safe.threshold)
  const [isChanged, setChanged] = useState<boolean>(false)
  const isSameThreshold = selectedThreshold === safe.threshold

  const { setSafeTx, setSafeTxError } = useContext(SafeTxContext)

  useEffect(() => {
    if (!selectedThreshold) return

    createUpdateThresholdTx(selectedThreshold).then(setSafeTx).catch(setSafeTxError)
  }, [selectedThreshold, setSafeTx, setSafeTxError])

  const handleChange = (event: SelectChangeEvent<number>) => {
    const newThreshold = parseInt(event.target.value.toString())
    setSelectedThreshold(newThreshold)
    setChanged(true)
  }

  const onChangeThreshold = () => {
    trackEvent({ ...SETTINGS_EVENTS.SETUP.OWNERS, label: safe.owners.length })
    trackEvent({ ...SETTINGS_EVENTS.SETUP.THRESHOLD, label: selectedThreshold })
  }

  return (
    <>
      <DialogContent>
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
            Current policy is already set to {safe.threshold}
          </Typography>
        ) : (
          <Typography mb={2}>
            {isChanged ? 'Previous policy was ' : 'Current policy is '}
            <b>
              {safe.threshold} out of {safe.owners.length}
            </b>
            .
          </Typography>
        )}
        <SignOrExecuteForm onSubmit={onChangeThreshold} disableSubmit={isSameThreshold} />
      </DialogContent>
    </>
  )
}

export default ReviewChangeThreshold
