import TxLayout from '@/components/tx-flow/common/TxLayout'
import useSafeInfo from '@/hooks/useSafeInfo'
import useTxStepper from '../../useTxStepper'
import { ReviewRemoveOwner } from './ReviewRemoveOwner'
import { ReviewSelectedOwner } from './ReviewSelectedOwner'
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
    <ReviewSelectedOwner key={0} params={data} onSubmit={() => nextStep(data)} />,
    <SetThreshold key={1} params={data} onSubmit={(formData) => nextStep({ ...data, ...formData })} />,
    <ReviewRemoveOwner key={2} params={data} />,
  ]

  return (
    <TxLayout title="Remove owner" step={step} onBack={prevStep}>
      {steps}
    </TxLayout>
  )
}

export default RemoveOwnerFlow
