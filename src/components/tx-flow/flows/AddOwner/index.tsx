import TxLayout from '@/components/tx-flow/common/TxLayout'
import useTxStepper from '../../useTxStepper'
import { ChooseOwner } from './ChooseOwner'
import { ReviewOwner } from './ReviewOwner'
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
    <ChooseOwner key={0} params={data} onSubmit={(formData) => nextStep({ ...data, ...formData })} />,
    <ReviewOwner key={1} params={data} />,
  ]

  return (
    <TxLayout title="New transaction" subtitle="Add owner" icon={SaveAddressIcon} step={step} onBack={prevStep}>
      {steps}
    </TxLayout>
  )
}

export default AddOwnerFlow
