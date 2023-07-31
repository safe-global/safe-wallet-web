import TxLayout from '@/components/tx-flow/common/TxLayout'
import useTxStepper from '@/components/tx-flow/useTxStepper'
import { ChooseOwner, ChooseOwnerMode } from '@/components/tx-flow/flows/AddOwner/ChooseOwner'
import { ReviewOwner } from '@/components/tx-flow/flows/AddOwner/ReviewOwner'
import SaveAddressIcon from '@/public/images/common/save-address.svg'
import useSafeInfo from '@/hooks/useSafeInfo'

type Owner = {
  address: string
  name?: string
}

export type AddOwnerFlowProps = {
  newOwner: Owner
  removedOwner?: Owner
  threshold: number
}

const AddOwnerFlow = () => {
  const { safe } = useSafeInfo()

  const defaultValues: AddOwnerFlowProps = {
    newOwner: {
      address: '',
      name: '',
    },
    threshold: safe.threshold,
  }

  const { data, step, nextStep, prevStep } = useTxStepper<AddOwnerFlowProps>(defaultValues)

  const steps = [
    <ChooseOwner
      key={0}
      params={data}
      onSubmit={(formData) => nextStep({ ...data, ...formData })}
      mode={ChooseOwnerMode.ADD}
    />,
    <ReviewOwner key={1} params={data} />,
  ]

  return (
    <TxLayout
      title={step === 0 ? 'New transaction' : 'Confirm transaction'}
      subtitle="Add owner"
      icon={SaveAddressIcon}
      step={step}
      onBack={prevStep}
    >
      {steps}
    </TxLayout>
  )
}

export default AddOwnerFlow
