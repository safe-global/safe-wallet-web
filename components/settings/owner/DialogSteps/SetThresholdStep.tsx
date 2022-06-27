import { ChangeOwnerData } from '@/components/settings/owner/DialogSteps/data'
import useSafeInfo from '@/hooks/useSafeInfo'
import { Button, Grid, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material'
import { useState } from 'react'

import css from './styles.module.css'

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

  const onSubmitHandler = () => {
    onSubmit({ ...data, threshold: selectedThreshold })
  }

  return (
    <div className={css.container}>
      <Typography>Set the required owner confirmations:</Typography>
      <span>Any transaction requires the confirmation of:</span>
      <Grid container direction="row" alignItems="center" gap={1}>
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
      <div className={css.submit}>
        <Button variant="contained" onClick={onSubmitHandler}>
          Next
        </Button>
      </div>
    </div>
  )
}
