import { Box, Divider, ListItemButton, SvgIcon, Typography } from '@mui/material'
import RelayerIcon from '@/public/images/common/relayer.svg'
import css from './styles.module.css'
import { type EducationSeriesStepperProps } from '@/components/relaying-education-series/RelaySeriesStepper/useEducationSeriesStepper'
import IndexNumber from '@/components/relaying-education-series/IndexNumber'
import classnames from 'classnames'

const Navigator = ({
  activeStep,
  steps,
  setStep,
}: {
  activeStep: number
  steps: EducationSeriesStepperProps['steps']
  setStep: (step: number) => void
}) => {
  return (
    <>
      <Box className={css.navigatorHeader}>
        <SvgIcon component={RelayerIcon} inheritViewBox />
        <Typography variant="h4" fontWeight={700}>
          Gas Balance (Relaying)
        </Typography>
      </Box>
      <Divider />
      <Box className={css.navigatorBody}>
        {steps.map((step, index) => (
          <ListItemButton
            key={index}
            className={classnames(css.navigatorBodyItem, { [css.active]: activeStep === index })}
            onClick={() => setStep(index)}
          >
            <IndexNumber value={index + 1} />
            <Typography>{step.title}</Typography>
          </ListItemButton>
        ))}
      </Box>
    </>
  )
}

export default Navigator
