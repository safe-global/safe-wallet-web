import { Box, Button, Grid, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material'
import { SyntheticEvent, useState } from 'react'
import { ChangeOwnerData } from '@/components/settings/owner/DialogSteps/types'
import TxModalTitle from '@/components/tx/TxModalTitle'
import useSafeInfo from '@/hooks/useSafeInfo'

export const SetThresholdStep = ({
  data,
  onSubmit,
}: {
  data: ChangeOwnerData
  onSubmit: (data: ChangeOwnerData) => void
}) => {
  const { safe } = useSafeInfo()
  const [selectedThreshold, setSelectedThreshold] = useState<number>(data.threshold ?? 1)

  const handleChange = (event: SelectChangeEvent<number>) => {
    setSelectedThreshold(parseInt(event.target.value.toString()))
  }

  const onSubmitHandler = (e: SyntheticEvent) => {
    e.preventDefault()
    onSubmit({ ...data, threshold: selectedThreshold })
  }

  return (
    <form onSubmit={onSubmitHandler}>
      <TxModalTitle>Add new owner</TxModalTitle>

      <Box py={3}>
        <Typography>Set the required owner confirmations:</Typography>

        <span>Any transaction requires the confirmation of:</span>

        <Grid container direction="row" alignItems="center" gap={1} pt={2}>
          <Grid item xs={1.5}>
            <Select value={selectedThreshold} onChange={handleChange} fullWidth>
              {safe?.owners.map((_, idx) => (
                <MenuItem key={idx + 1} value={idx + 1}>
                  {idx + 1}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item>
            <Typography>out of {(safe?.owners.length ?? 0) + 1} owner(s)</Typography>
          </Grid>
        </Grid>
      </Box>

      <Button variant="contained" type="submit">
        Next
      </Button>
    </form>
  )
}
