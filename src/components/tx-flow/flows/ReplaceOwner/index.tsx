import TxLayout from '@/components/tx-flow/common/TxLayout'
import useTxStepper from '../../useTxStepper'
import useSafeInfo from '@/hooks/useSafeInfo'
import { ReviewOwner } from '../AddOwner/ReviewOwner'
import { ChooseOwner } from '../AddOwner/ChooseOwner'

type Owner = {
  address: string
  name?: string
}

export type ReplaceOwnerFlowProps = {
  newOwner: Owner
  removedOwner: Owner
  threshold: number
}

const ReplaceOwnerFlow = ({ address }: { address: string }) => {
  const { safe } = useSafeInfo()

  const defaultValues: ReplaceOwnerFlowProps = {
    newOwner: { address: '' },
    removedOwner: { address },
    threshold: safe.threshold,
  }

  const { data, step, nextStep, prevStep } = useTxStepper<ReplaceOwnerFlowProps>(defaultValues)

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

export default ReplaceOwnerFlow
