import TxLayout from '../../common/TxLayout'
import useTxStepper from '../../useTxStepper'
import { CreateSpendingLimit } from './CreateSpendingLimit'
import { ReviewSpendingLimit } from './ReviewSpendingLimit'

export type NewSpendingLimitFlowProps = {
  beneficiary: string
  tokenAddress: string
  amount: string
  resetTime: string
}

const defaultValues: NewSpendingLimitFlowProps = {
  beneficiary: '',
  tokenAddress: '',
  amount: '',
  resetTime: '0',
}

const NewSpendingLimitFlow = () => {
  const { data, step, nextStep, prevStep } = useTxStepper<NewSpendingLimitFlowProps>(defaultValues)

  const steps = [
    <CreateSpendingLimit key={0} params={data} onSubmit={(formData) => nextStep({ ...data, ...formData })} />,
    <ReviewSpendingLimit key={1} params={data} />,
  ]

  return (
    <TxLayout title="New spending limit" step={step} onBack={prevStep}>
      {steps}
    </TxLayout>
  )
}

export default NewSpendingLimitFlow
