import { Box, Card, Grid, Typography } from '@mui/material'
import Navigator from '@/components/relaying-education-series/Navigator'
import { type TxStepperProps } from '@/components/new-safe/CardStepper/useCardStepper'
import { useCardStepper } from '@/components/new-safe/CardStepper/useCardStepper'
import { lightPalette } from '@safe-global/safe-react-components'
import { useState } from 'react'
import css from './styles.module.css'

function RelaySeriesStepper<StepperData>(props: TxStepperProps<StepperData>) {
  const [progressColor, setProgressColor] = useState(lightPalette.secondary.main)
  const { activeStep, onSubmit, onBack, stepData, setStep } = useCardStepper<StepperData>(props)
  const { steps } = props
  const currentStep = steps[activeStep]

  return (
    <Grid container spacing={3}>
      {currentStep.title && (
        <Grid item width="648px">
          <Card className={css.infoCard}>
            <Box display="flex" alignItems="center" gap="12px">
              <Typography className={css.step}>
                {(activeStep + 1).toLocaleString('en-US', {
                  minimumIntegerDigits: 2,
                  useGrouping: false,
                })}
              </Typography>
              <h1>{currentStep.title}</h1>
            </Box>
            {currentStep.render(stepData, onSubmit, onBack, setStep, setProgressColor)}
          </Card>
        </Grid>
      )}
      <Grid item>
        <Card>
          <Navigator setStep={setStep} />
        </Card>
      </Grid>
    </Grid>
  )
}

export default RelaySeriesStepper
