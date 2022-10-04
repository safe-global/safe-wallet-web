import type { SelectChangeEvent } from '@mui/material'
import { Button, DialogContent, Grid, MenuItem, Select, Typography } from '@mui/material'
import type { SyntheticEvent } from 'react'
import { useState } from 'react'
import type { ChangeOwnerData } from '@/components/settings/owner/AddOwnerDialog/DialogSteps/types'
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

  const newNumberOfOwners = safe.owners.length + 1

  return (
    <form onSubmit={onSubmitHandler}>
      <DialogContent>
        <Typography mb={2}>Set the required owner confirmations:</Typography>

        <Typography variant="body2">Any transaction requires the confirmation of:</Typography>

        <Grid container direction="row" alignItems="center" gap={1} pt={1}>
          <Grid item xs={1.5}>
            <Select value={selectedThreshold} onChange={handleChange} fullWidth>
              {safe.owners.map((_, idx) => (
                <MenuItem key={idx + 1} value={idx + 1}>
                  {idx + 1}
                </MenuItem>
              ))}
              <MenuItem key={newNumberOfOwners} value={newNumberOfOwners}>
                {newNumberOfOwners}
              </MenuItem>
            </Select>
          </Grid>
          <Grid item>
            <Typography>out of {newNumberOfOwners} owner(s)</Typography>
          </Grid>
        </Grid>
      </DialogContent>

      <Button variant="contained" type="submit">
        Next
      </Button>
    </form>
  )
}
