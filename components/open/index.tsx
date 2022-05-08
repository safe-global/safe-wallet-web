import React from 'react'

import TxStepper, { TxStepperProps } from '@/components/tx/TxStepper'
import Connect from '@/components/open/Connect'
import Name from '@/components/open/Name'
import OwnersAndConfirmations from '@/components/open/OwnersAndConfirmations'
import Review from '@/components/open/Review'

type Owner = {
  name: string
  address: string
}

export type CreateSafeFormData = {
  name: string
  threshold: number
  owners: Owner[]
}

export const CreateSafeSteps: TxStepperProps['steps'] = [
  {
    label: 'Connect wallet & select network',
    render: (data, onSubmit) => <Connect onSubmit={onSubmit} />,
  },
  {
    label: 'Name',
    render: (data, onSubmit) => <Name onSubmit={onSubmit} />,
  },
  {
    label: 'Owners and Confirmations',
    render: (data, onSubmit) => <OwnersAndConfirmations params={data as CreateSafeFormData} onSubmit={onSubmit} />,
  },
  {
    label: 'Review',
    render: (data) => <Review params={data as CreateSafeFormData} />,
  },
]

const CreateSafe = () => {
  return <TxStepper steps={CreateSafeSteps} onClose={() => {}} orientation="vertical" />
}

export default CreateSafe
