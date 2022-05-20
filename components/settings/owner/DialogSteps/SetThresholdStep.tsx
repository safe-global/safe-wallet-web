import { ChangeOwnerData } from '@/components/settings/owner/DialogSteps/data'
import useSafeInfo from '@/services/useSafeInfo'
import { Button, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material'
import { useEffect, useState } from 'react'

import css from './styles.module.css'

export const SetThresholdStep = ({
  data,
  onSubmit,
}: {
  data: ChangeOwnerData
  onSubmit: (data: ChangeOwnerData) => void
}) => {
  const { safe } = useSafeInfo()
  const [options, setOptions] = useState<number[]>([0])
  const [selectedThreshold, setSelectedThreshold] = useState<number>(data.threshold ?? 1)
  useEffect(() => {
    setOptions(Array.from(Array((safe?.owners.length ?? 0) + 1).keys()))
  }, [safe])

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
      <span>
        <Select value={selectedThreshold} onChange={handleChange}>
          {options.map((option) => (
            <MenuItem key={option + 1} value={option + 1}>
              {option + 1}
            </MenuItem>
          ))}
        </Select>{' '}
        out of {(safe?.owners.length ?? 0) + 1} owner(s)
      </span>
      <div className={css.submit}>
        <Button variant="contained" onClick={onSubmitHandler}>
          Next
        </Button>
      </div>
    </div>
  )
}
