import { useState } from 'react'
import { DialogContent, Typography, Grid, Select, MenuItem, Button, DialogActions } from '@mui/material'
import type { SyntheticEvent } from 'react'
import type { SelectChangeEvent } from '@mui/material'

import useSafeInfo from '@/hooks/useSafeInfo'
import type { AddOwnerFlowProps } from '.'
import type { ReplaceOwnerFlowProps } from '../ReplaceOwner'

export const SetThreshold = ({
  params,
  onSubmit,
}: {
  params: AddOwnerFlowProps | ReplaceOwnerFlowProps
  onSubmit: (data: Pick<AddOwnerFlowProps | ReplaceOwnerFlowProps, 'threshold'>) => void
}) => {
  const { safe } = useSafeInfo()
  const [selectedThreshold, setSelectedThreshold] = useState<number>(params.threshold || 1)

  const handleChange = (event: SelectChangeEvent<number>) => {
    setSelectedThreshold(parseInt(event.target.value.toString()))
  }

  const onSubmitHandler = (e: SyntheticEvent) => {
    e.preventDefault()
    onSubmit({ threshold: selectedThreshold })
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

      <DialogActions>
        <Button variant="contained" type="submit">
          Next
        </Button>
      </DialogActions>
    </form>
  )
}
