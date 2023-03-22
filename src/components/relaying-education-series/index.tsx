import WhatIsRelaying from '@/components/relaying-education-series/steps/WhatIsRelaying'
import HowItWorks from '@/components/relaying-education-series/steps/HowItWorks'
import Benefits from '@/components/relaying-education-series/steps/Benefits'
import TechnicalInformation from '@/components/relaying-education-series/steps/TechnicalInformation'
import RelaySeriesStepper from '@/components/relaying-education-series/RelaySeriesStepper'
import { type EducationSeriesStepperProps } from '@/components/relaying-education-series/RelaySeriesStepper/useEducationSeriesStepper'
import { useRouter } from 'next/router'
import { AppRoutes } from '@/config/routes'
import { type UrlObject } from 'url'

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

const RelayingEducationSeries = () => {
  const router = useRouter()

  const homeLink: UrlObject = {
    pathname: AppRoutes.home,
    query: { safe: router.query.safe },
  }

  const onClose = () => router.push(homeLink)

  return <RelaySeriesStepper steps={RelayingSeriesSteps} onClose={onClose} />
}

export default RelayingEducationSeries
