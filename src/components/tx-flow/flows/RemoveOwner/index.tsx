import TxLayout from '@/components/tx-flow/common/TxLayout'
import useSafeInfo from '@/hooks/useSafeInfo'
import useTxStepper from '../../useTxStepper'
import { ReviewRemoveOwner } from './ReviewRemoveOwner'
import SaveAddressIcon from '@/public/images/common/save-address.svg'
import { SetThreshold } from './SetThreshold'

type Owner = {
  address: string
  name?: string
}

export type RemoveOwnerFlowProps = {
  removedOwner: Owner
  threshold: number
}

const RemoveOwnerFlow = (props: Owner) => {
  const { safe } = useSafeInfo()

  const defaultValues: RemoveOwnerFlowProps = {
    removedOwner: props,
    threshold: Math.min(safe.threshold, safe.owners.length - 1),
  }

  const { data, step, nextStep, prevStep } = useTxStepper<RemoveOwnerFlowProps>(defaultValues)

  const steps = [
    <SetThreshold key={0} params={data} onSubmit={(formData: any) => nextStep({ ...data, ...formData })} />,
    <ReviewRemoveOwner key={1} params={data} />,
  ]

  return (
    <TxLayout
      title={step === 0 ? 'New transaction' : 'Confirm transaction'}
      subtitle="Remove owner"
      icon={SaveAddressIcon}
      step={step}
      onBack={prevStep}
    >
      {steps}
    </TxLayout>
  )
}

export default RemoveOwnerFlow
