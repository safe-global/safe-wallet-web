import { createStepper } from '@/components/TxFlow/StepperFactory'
import { type SendAssetsFormData } from '@/components/tx/modals/TokenTransferModal/SendAssetsForm'

export const TokenTransferStepper = createStepper<[SendAssetsFormData, {}]>()
