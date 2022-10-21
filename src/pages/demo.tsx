import { FormControlLabel, MenuItem, Radio, Grid, Button } from '@mui/material'
import { useForm } from 'react-hook-form'
import type { NextPage } from 'next'

import { SafeRadioGroup, SafeSelect, SafeSwitch, SafeTextField } from '@/components/common/inputs'

type DemoForm = {
  text: string
  select: number
  radio: boolean
  switch: boolean
}

const Demo: NextPage = () => {
  const { control, handleSubmit, setValue } = useForm<DemoForm>({
    defaultValues: { text: 'Test', select: 10, radio: true, switch: true },
  })

  const onSubmit = (data: DemoForm) => {
    console.log(data)
  }

  return (
    <main>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <SafeTextField<DemoForm> label="Text field" name="text" control={control} required fullWidth />
          </Grid>

          <Grid item xs={6}>
            <SafeSelect<DemoForm>
              label="Select"
              name="select"
              control={control}
              required
              fullWidth
              rules={{
                validate: (val) => {
                  return val > 10 || 'Invalid amount'
                },
              }}
              helperText="Must be greater than 10"
            >
              <MenuItem value={10}>Ten</MenuItem>
              <MenuItem value={20}>Twenty</MenuItem>
              <MenuItem value={30}>Thirty</MenuItem>
            </SafeSelect>
          </Grid>

          <Grid item xs={6}>
            <SafeRadioGroup<DemoForm>
              label="Radio group"
              name="radio"
              control={control}
              rules={{
                onChange: (e) => {
                  setValue(e.target.name, JSON.parse(e.target.value))
                },
              }}
            >
              <FormControlLabel value="true" label="Yes" control={<Radio />} />
              <FormControlLabel value="false" label="No" control={<Radio />} />
            </SafeRadioGroup>
          </Grid>

          <Grid item xs={6}>
            <SafeSwitch<DemoForm> label="Switch" name="switch" control={control} />
          </Grid>

          <Grid item>
            <Button type="submit" variant="contained">
              Submit
            </Button>
          </Grid>
        </Grid>
      </form>
    </main>
  )
}

export default Demo
