import { createStepper } from '@/services/StepperFactory'
import { type SendAssetsFormData } from '@/components/tx/modals/TokenTransferModal/SendAssetsForm'

const TokenTransferContext = createStepper<[SendAssetsFormData, {}]>()

export const useTokenTransferStepper = TokenTransferContext.useStepper

export const TokenTransfer = TokenTransferContext.Provider
