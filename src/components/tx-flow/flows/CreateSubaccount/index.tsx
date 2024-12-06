import SubaccountsIcon from '@/public/images/sidebar/subaccounts-icon.svg'
import TxLayout from '@/components/tx-flow/common/TxLayout'
import useTxStepper from '@/components/tx-flow/useTxStepper'
import { ReviewSubaccount } from '@/components/tx-flow/flows/CreateSubaccount/ReviewSubaccount'
import { SetUpSubaccount } from '@/components/tx-flow/flows/CreateSubaccount/SetupSubaccount'
import type { SetupSubaccountForm } from '@/components/tx-flow/flows/CreateSubaccount/SetupSubaccount'

export function CreateSubaccount() {
  const { data, step, nextStep, prevStep } = useTxStepper<SetupSubaccountForm>({
    name: '',
    assets: [],
  })

  const steps = [
    <SetUpSubaccount key={0} params={data} onSubmit={(formData) => nextStep({ ...data, ...formData })} />,
    <ReviewSubaccount key={1} params={data} />,
  ]

  return (
    <TxLayout
      title={step === 0 ? 'Set up Subaccount' : 'Confirm Subaccount'}
      subtitle="Create a Subaccount"
      icon={SubaccountsIcon}
      step={step}
      onBack={prevStep}
    >
      {steps}
    </TxLayout>
  )
}
