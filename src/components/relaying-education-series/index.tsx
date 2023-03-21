import WhatIsRelaying from '@/components/relaying-education-series/steps/what-is-relaying'
import HowItWorks from '@/components/relaying-education-series/steps/how-it-works'
import Benefits from '@/components/relaying-education-series/steps/benefits'
import TechnicalInformation from '@/components/relaying-education-series/steps/technical-information'
import { Container } from '@mui/material'
import RelaySeriesStepper from '@/components/relaying-education-series/RelaySeriesStepper'
import { type EducationSeriesStepperProps } from '@/components/relaying-education-series/RelaySeriesStepper/useEducationSeriesStepper'

const RelayingEducationSeries = () => {
  const RelayingSeriesSteps: EducationSeriesStepperProps['steps'] = [
    {
      title: 'What is relaying?',
      render: (_, onNext, onClose) => <WhatIsRelaying onNext={onNext} onClose={onClose} />,
    },
    {
      title: 'How it works?',
      render: (onBack, onNext, onClose) => <HowItWorks onBack={onBack} onNext={onNext} onClose={onClose} />,
    },
    {
      title: 'Benefits',
      render: (onBack, onNext, onClose) => <Benefits onBack={onBack} onNext={onNext} onClose={onClose} />,
    },
    {
      title: 'Technical information',
      render: (onBack, _, onClose) => <TechnicalInformation onBack={onBack} onClose={onClose} />,
    },
  ]

  return (
    <Container sx={{ margin: '86px 113px' }}>
      <RelaySeriesStepper steps={RelayingSeriesSteps} onClose={() => {}} />
    </Container>
  )
}

export default RelayingEducationSeries
