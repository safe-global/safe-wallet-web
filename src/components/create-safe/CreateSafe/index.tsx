import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import { Button, Typography, Grid } from '@mui/material'
import { useRouter } from 'next/router'

import CreateSafeStep1 from '../steps/Step1'

import css from './styles.module.css'

const CreateSafe = () => {
  const router = useRouter()

  const onBack = () => {
    router.back()

    // Logic to be handled by stepper hook
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={1} />
      <Grid item xs={6}>
        <Button variant="text" startIcon={<ChevronLeftIcon />} className={css.back} onClick={onBack}>
          Back
        </Button>

        <Typography variant="h2" className={css.title}>
          Create new Safe
        </Typography>

        <CreateSafeStep1 />
      </Grid>
    </Grid>
  )
}

export default CreateSafe
