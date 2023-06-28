import TxLayout from '../../common/TxLayout'
import useTxStepper from '../../useTxStepper'
import { CreateSpendingLimit } from './CreateSpendingLimit'
import { ReviewSpendingLimit } from './ReviewSpendingLimit'
import SaveAddressIcon from '@/public/images/common/save-address.svg'
import { ZERO_ADDRESS } from '@safe-global/safe-core-sdk/dist/src/utils/constants'

export type NewSpendingLimitFlowProps = {
  beneficiary: string
  tokenAddress: string
  amount: string
  resetTime: string
}

const defaultValues: NewSpendingLimitFlowProps = {
  beneficiary: '',
  tokenAddress: ZERO_ADDRESS,
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
    <TxLayout
      title={step === 0 ? 'New Transaction' : 'Confirm Transaction'}
      subtitle="Spending Limit"
      icon={SaveAddressIcon}
      step={step}
      onBack={prevStep}
    >
      {steps}
    </TxLayout>
  )
}

export default NewSpendingLimitFlow
