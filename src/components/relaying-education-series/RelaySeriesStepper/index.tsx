import { Box, Card, IconButton, SvgIcon, Typography } from '@mui/material'
import Navigator from '@/components/relaying-education-series/Navigator'
import useEducationSeriesStepper, {
  type EducationSeriesStepperProps,
} from '@/components/relaying-education-series/RelaySeriesStepper/useEducationSeriesStepper'
import { ProgressBar } from '@/components/common/ProgressBar'
import CloseIcon from '@/public/images/common/close.svg'
import css from './styles.module.css'

const RelaySeriesStepper = (props: EducationSeriesStepperProps) => {
  const { onBack, onNext, activeStep, setStep, onClose, progress } = useEducationSeriesStepper({ ...props })
  const { steps } = props
  const currentStep = steps[activeStep]

  return (
    <Box display="flex" gap={3} mt="86px" ml="114px">
      <Card className={css.infoCard}>
        <ProgressBar value={progress} />
        <Box display="flex" alignItems="center" gap="12px">
          <Typography className={css.step}>
            {(activeStep + 1).toLocaleString('en-US', {
              minimumIntegerDigits: 2,
              useGrouping: false,
            })}
          </Typography>
          <h1>{currentStep.title}</h1>
          <span style={{ flex: '1' }} />
          <IconButton onClick={onClose}>
            <SvgIcon component={CloseIcon} inheritViewBox fontSize="small" />
          </IconButton>
        </Box>
        {currentStep.render(onBack, onNext, onClose)}
      </Card>
      <Card className={css.navigator}>
        <Navigator setStep={setStep} />
      </Card>
    </Box>
  )
}

export default RelaySeriesStepper
