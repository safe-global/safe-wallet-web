import WhatIsRelaying from '@/components/relaying-education-series/steps/what-is-relaying'
import HowItWorks from '@/components/relaying-education-series/steps/how-it-works'
import Benefits from '@/components/relaying-education-series/steps/benefits'
import TechnicalInformation from '@/components/relaying-education-series/steps/technical-information'
import { Container } from '@mui/material'
import RelaySeriesStepper from '@/components/relaying-education-series/RelaySeriesStepper'

const RelayingEducationSeries = () => {
  const RelayingSeriesSteps = [
    {
      title: 'What is relaying?',
      subtitle: '',
      render: () => <WhatIsRelaying />,
    },
    {
      title: 'How it works?',
      subtitle: '',
      render: () => <HowItWorks />,
    },
    {
      title: 'Benefits',
      subtitle: '',
      render: () => <Benefits />,
    },
    {
      title: 'Technical information',
      subtitle: '',
      render: () => <TechnicalInformation />,
    },
  ]

  return (
    <Container sx={{ margin: '86px 113px' }}>
      <RelaySeriesStepper steps={RelayingSeriesSteps} initialData={{}} onClose={() => {}} />
    </Container>
  )
}

export default RelayingEducationSeries
