import type { ChangeEvent, ReactElement } from 'react'
import { FormControlLabel, RadioGroup, Radio, Typography } from '@mui/material'
import { trackEvent, MODALS_EVENTS } from '@/services/analytics'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectSettings, setTransactionExecution } from '@/store/settingsSlice'

import css from './styles.module.css'

const ExecuteCheckbox = ({ onChange }: { onChange: (checked: boolean) => void }): ReactElement => {
  const settings = useAppSelector(selectSettings)
  const dispatch = useAppDispatch()

  const handleChange = (_: ChangeEvent<HTMLInputElement>, value: string) => {
    const checked = value === 'true'
    trackEvent({ ...MODALS_EVENTS.EXECUTE_TX, label: checked })
    dispatch(setTransactionExecution(checked))
    onChange(checked)
  }

  return (
    <>
      <Typography>Would you like to execute the transaction immediately?</Typography>

      <RadioGroup row value={String(settings.transactionExecution)} onChange={handleChange} className={css.group}>
        <FormControlLabel
          value="true"
          label={
            <>
              Yes, <b>execute</b>
            </>
          }
          control={<Radio />}
          className={css.radio}
        />
        <FormControlLabel value="false" label={<>No, later</>} control={<Radio />} className={css.radio} />
      </RadioGroup>
    </>
  )
}

export default ExecuteCheckbox
