import { Box, Card, IconButton, SvgIcon } from '@mui/material'
import Navigator from '@/components/relaying-educational/Navigator'
import useEducationSeriesStepper, {
  type EducationSeriesStepperProps,
} from '@/components/relaying-educational/RelaySeriesStepper/useEducationSeriesStepper'
import ProgressBar from '@/components/common/ProgressBar'
import CloseIcon from '@/public/images/common/close.svg'
import IndexNumber from '@/components/relaying-educational/IndexNumber'
import css from './styles.module.css'

const RelaySeriesStepper = (props: EducationSeriesStepperProps) => {
  const { onBack, onNext, activeStep, setStep, onClose, progress } = useEducationSeriesStepper(props)
  const { steps } = props
  const currentStep = steps[activeStep]

  return (
    <Box className={css.wrapper}>
      <Card className={css.infoCard}>
        <ProgressBar value={progress} />
        <Box display="flex" alignItems="center" gap="12px">
          <IndexNumber value={activeStep + 1} />
          <h1>{currentStep.title}</h1>
          <span style={{ flex: '1' }} />
          <IconButton onClick={onClose}>
            <SvgIcon component={CloseIcon} inheritViewBox fontSize="small" sx={{ color: 'primary.main' }} />
          </IconButton>
        </Box>
        {currentStep.render(onBack, onNext, onClose)}
      </Card>
      <Card className={css.navigator}>
        <Navigator activeStep={activeStep} setStep={setStep} steps={steps} />
      </Card>
    </Box>
  )
}

export default RelaySeriesStepper
