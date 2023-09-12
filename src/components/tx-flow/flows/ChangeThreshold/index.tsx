import TxLayout from '@/components/tx-flow/common/TxLayout'
import ReviewChangeThreshold from '@/components/tx-flow/flows/ChangeThreshold/ReviewChangeThreshold'
import useTxStepper from '@/components/tx-flow/useTxStepper'
import SaveAddressIcon from '@/public/images/common/save-address.svg'
import useSafeInfo from '@/hooks/useSafeInfo'
import { ChooseThreshold } from '@/components/tx-flow/flows/ChangeThreshold/ChooseThreshold'

export enum ChangeThresholdFlowFieldNames {
  threshold = 'threshold',
}

export type ChangeThresholdFlowProps = {
  [ChangeThresholdFlowFieldNames.threshold]: number
}

const ChangeThresholdFlow = () => {
  const { safe } = useSafeInfo()

  const { data, step, nextStep, prevStep } = useTxStepper<ChangeThresholdFlowProps>({
    [ChangeThresholdFlowFieldNames.threshold]: safe.threshold,
  })

  const steps = [
    <ChooseThreshold key={0} params={data} onSubmit={(formData) => nextStep(formData)} />,
    <ReviewChangeThreshold key={1} params={data} />,
  ]

  return (
    <TxLayout
      title={step === 0 ? 'New transaction' : 'Confirm transaction'}
      subtitle="Change threshold"
      icon={SaveAddressIcon}
      step={step}
      onBack={prevStep}
    >
      {steps}
    </TxLayout>
  )
}

export default ChangeThresholdFlow
