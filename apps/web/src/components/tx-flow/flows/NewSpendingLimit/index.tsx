import TxLayout from '../../common/TxLayout'
import useTxStepper from '../../useTxStepper'
import { CreateSpendingLimit } from './CreateSpendingLimit'
import { ReviewSpendingLimit } from './ReviewSpendingLimit'
import SaveAddressIcon from '@/public/images/common/save-address.svg'
import { ZERO_ADDRESS } from '@safe-global/protocol-kit/dist/src/utils/constants'
import { TokenAmountFields } from '@/components/common/TokenAmountInput'

enum Fields {
  beneficiary = 'beneficiary',
  resetTime = 'resetTime',
}

export const SpendingLimitFields = { ...Fields, ...TokenAmountFields }

export type NewSpendingLimitFlowProps = {
  [SpendingLimitFields.beneficiary]: string
  [SpendingLimitFields.tokenAddress]: string
  [SpendingLimitFields.amount]: string
  [SpendingLimitFields.resetTime]: string
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
      title={step === 0 ? 'New transaction' : 'Confirm transaction'}
      subtitle="Spending limit"
      icon={SaveAddressIcon}
      step={step}
      onBack={prevStep}
    >
      {steps}
    </TxLayout>
  )
}

export default NewSpendingLimitFlow
