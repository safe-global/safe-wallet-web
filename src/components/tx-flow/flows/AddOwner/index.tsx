import TxLayout from '@/components/tx-flow/common/TxLayout'
import useTxStepper from '../../useTxStepper'
import { ChooseOwner } from './ChooseOwner'
import { ReviewOwner } from './ReviewOwner'

type Owner = {
  address: string
  name?: string
}

export type AddOwnerFlowProps = {
  newOwner: Owner
  removedOwner?: Owner
  threshold?: number
}

const defaultValues: AddOwnerFlowProps = {
  newOwner: {
    address: '',
    name: '',
  },
}

const AddOwnerFlow = () => {
  const { data, step, nextStep, prevStep } = useTxStepper<AddOwnerFlowProps>(defaultValues)

  const steps = [
    <ChooseOwner key={0} params={data} onSubmit={(formData) => nextStep({ ...data, ...formData })} />,
    <ReviewOwner key={1} params={data} />,
  ]

  return (
    <TxLayout title="Add new owner" step={step} onBack={prevStep}>
      {steps}
    </TxLayout>
  )
}

export default AddOwnerFlow
