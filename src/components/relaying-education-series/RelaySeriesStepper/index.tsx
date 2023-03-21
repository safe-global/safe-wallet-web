import { Box, Card, Typography } from '@mui/material'
import Navigator from '@/components/relaying-education-series/Navigator'
import useEducationSeriesStepper, {
  type EducationSeriesStepperProps,
} from '@/components/relaying-education-series/RelaySeriesStepper/useEducationSeriesStepper'
import css from './styles.module.css'

const RelaySeriesStepper = (props: EducationSeriesStepperProps) => {
  // const [progressColor, setProgressColor] = useState(lightPalette.secondary.main)
  const { onBack, onNext, activeStep, setStep, onClose } = useEducationSeriesStepper({
    steps: props.steps,
    onClose: props.onClose,
  })
  const { steps } = props
  const currentStep = steps[activeStep]

  return (
    <Box display="flex" gap={3} mt="86px" ml="114px">
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
        {currentStep.render(onBack, onNext, onClose)}
      </Card>
      <Card>
        <Navigator setStep={setStep} />
      </Card>
    </Box>
  )
}

export default RelaySeriesStepper
