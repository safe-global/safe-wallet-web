import React from 'react'
import { useRouter } from 'next/router'

import { LOAD_SAFE_CATEGORY } from '@/services/analytics'
import { Container, Grid, Typography } from '@mui/material'
import { CardStepper } from '@/components/new-safe/CardStepper'
import type { TxStepperProps } from '@/components/new-safe/CardStepper/useCardStepper'
import type { NamedAddress } from '@/components/create-safe/types'
import LoadSafeStep0 from '@/components/new-safe/load/steps/Step0'
import { AppRoutes } from '@/config/routes'
import LoadSafeStep1 from '@/components/new-safe/load/steps/Step1'
import LoadSafeStep2 from '@/components/new-safe/load/steps/Step2'

export type LoadSafeFormData = NamedAddress & {
  threshold: number
  owners: NamedAddress[]
}

export const LoadSafeSteps: TxStepperProps<LoadSafeFormData>['steps'] = [
  {
    title: 'Connect wallet & select network',
    subtitle: 'Select network on which the Safe was created',
    render: (_, onSubmit, onBack, setStep) => (
      <LoadSafeStep0 onSubmit={onSubmit} onBack={onBack} data={_} setStep={setStep} />
    ),
  },
  {
    title: 'Owners and confirmations',
    subtitle: 'Optional: Provide a name for each owner.',
    render: (data, onSubmit, onBack, setStep) => (
      <LoadSafeStep1 onSubmit={onSubmit} onBack={onBack} data={data} setStep={setStep} />
    ),
  },
  {
    title: 'Review',
    subtitle: 'Confirm loading Safe.',
    render: (data, onSubmit, onBack, setStep) => (
      <LoadSafeStep2 onSubmit={onSubmit} onBack={onBack} data={data} setStep={setStep} />
    ),
  },
]

export const loadSafeDefaultData = { threshold: -1, owners: [], address: '', name: '' }

const LoadSafe = ({ initialData }: { initialData?: TxStepperProps<LoadSafeFormData>['initialData'] }) => {
  const router = useRouter()

  const onClose = () => {
    router.push(AppRoutes.welcome)
  }

  const initialSafe = initialData ?? loadSafeDefaultData

  return (
    <Container>
      <Grid container columnSpacing={3} mt={[2, null, 7]}>
        <Grid item xs={12}>
          <Typography variant="h2" pb={2}>
            Load Safe
          </Typography>
        </Grid>
        <Grid item xs={12} md={8} order={[1, null, 0]}>
          <CardStepper
            initialData={initialSafe}
            onClose={onClose}
            steps={LoadSafeSteps}
            eventCategory={LOAD_SAFE_CATEGORY}
          />
        </Grid>
      </Grid>
    </Container>
  )
}

export default LoadSafe
