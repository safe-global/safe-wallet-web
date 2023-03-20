import { lazy } from 'react'

import { createStepper } from '@/services/StepperFactory'

const steps = [
  lazy(() => import('@/components/relaying-education-series/steps/what-is-relaying')),
  lazy(() => import('@/components/relaying-education-series/steps/how-it-works')),
  lazy(() => import('@/components/relaying-education-series/steps/benefits')),
  lazy(() => import('@/components/relaying-education-series/steps/technical-information')),
]

const RelayingEducationSeriesContext = createStepper({ steps })

export const useRelayingEducationSeriesStepper = RelayingEducationSeriesContext.useStepper

export const RelayingEducationSeries = RelayingEducationSeriesContext.Stepper
