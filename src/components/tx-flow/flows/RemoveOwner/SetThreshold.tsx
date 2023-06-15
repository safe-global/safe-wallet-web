import { Button, Grid, MenuItem, Select, Typography, CardActions } from '@mui/material'
import { useState } from 'react'
import useSafeInfo from '@/hooks/useSafeInfo'
import type { SyntheticEvent } from 'react'
import type { SelectChangeEvent } from '@mui/material'
import type { RemoveOwnerFlowProps } from '.'
import TxCard from '../../common/TxCard'

export const SetThreshold = ({
  params,
  onSubmit,
}: {
  params: RemoveOwnerFlowProps
  onSubmit: (data: RemoveOwnerFlowProps) => void
}) => {
  const { safe } = useSafeInfo()
  const [selectedThreshold, setSelectedThreshold] = useState<number>(params.threshold || 1)

  const handleChange = (event: SelectChangeEvent<number>) => {
    setSelectedThreshold(parseInt(event.target.value.toString()))
  }

  const onSubmitHandler = (e: SyntheticEvent) => {
    e.preventDefault()
    onSubmit({ ...params, threshold: selectedThreshold })
  }

  const newNumberOfOwners = safe ? safe.owners.length - 1 : 1

  return (
    <TxCard>
      <form onSubmit={onSubmitHandler}>
        <Typography mb={3}>Set the required owner confirmations:</Typography>

        <Typography variant="body2">Any transaction requires the confirmation of:</Typography>

        <Grid container direction="row" alignItems="center" gap={1} mt={1}>
          <Grid item xs={1.5}>
            <Select value={selectedThreshold} onChange={handleChange} fullWidth>
              {safe.owners.slice(1).map((_, idx) => (
                <MenuItem key={idx + 1} value={idx + 1}>
                  {idx + 1}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item>
            <Typography>out of {newNumberOfOwners} owner(s)</Typography>
          </Grid>
        </Grid>

        <CardActions>
          <Button variant="contained" type="submit">
            Next
          </Button>
        </CardActions>
      </form>
    </TxCard>
  )
}
