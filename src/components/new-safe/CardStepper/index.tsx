import { useState } from 'react'
import { Box } from '@mui/system'
import lightPalette from '@/components/theme/lightPalette'
import css from './styles.module.css'
import Card from '@mui/material/Card'
import LinearProgress from '@mui/material/LinearProgress'
import CardHeader from '@mui/material/CardHeader'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import type { TxStepperProps } from './useCardStepper'
import { useCardStepper } from './useCardStepper'

export function CardStepper<StepperData>(props: TxStepperProps<StepperData>) {
  const [progressColor, setProgressColor] = useState(lightPalette.secondary.main)
  const { activeStep, onSubmit, onBack, stepData, setStep, setStepData } = useCardStepper<StepperData>(props)
  const { steps } = props
  const currentStep = steps[activeStep]
  const progress = ((activeStep + 1) / steps.length) * 100

  return (
    <Card className={css.card}>
      <Box
        className={css.progress}
        sx={{
          color: progressColor,
        }}
      >
        <LinearProgress color="inherit" variant="determinate" value={Math.min(progress, 100)} />
      </Box>
      {currentStep.title && (
        <CardHeader
          title={currentStep.title}
          subheader={currentStep.subtitle}
          titleTypographyProps={{ variant: 'h4' }}
          subheaderTypographyProps={{ variant: 'body2' }}
          avatar={
            <Avatar className={css.step}>
              <Typography variant="body2">{activeStep + 1}</Typography>
            </Avatar>
          }
          className={css.header}
        />
      )}
      <CardContent className={css.content}>
        {currentStep.render(stepData, onSubmit, onBack, setStep, setProgressColor, setStepData)}
      </CardContent>
    </Card>
  )
}
