import { TokenTransferStepper } from '@/components/TxFlow/TokenTransfer/index'
import { SendTxType } from '@/components/tx/modals/TokenTransferModal/SendAssetsForm'
import CreateTokenTransfer from '@/components/TxFlow/TokenTransfer/CreateTokenTransfer'
import ReviewTokenTransfer from '@/components/TxFlow/TokenTransfer/ReviewTokenTransfer'
import TxLayout from '@/components/TxFlow/common/TxLayout'
import { ProgressBar } from '@/components/common/ProgressBar'
import { SuccessScreen } from '@/components/TxFlow/SuccessScreen'

const initialData = {
  recipient: '',
  tokenAddress: '',
  amount: '',
  type: SendTxType.multiSig,
}

const TokenTransferFlow = ({ txNonce }: { txNonce?: number }) => {
  const steps = [
    <CreateTokenTransfer key={0} disableSpendingLimit={txNonce !== undefined} />,
    <ReviewTokenTransfer key={1} txNonce={txNonce} />,
    <SuccessScreen key={2} />,
  ]

  return (
    <TokenTransferStepper.Provider steps={steps} defaultValues={[initialData, {}]}>
      {(Step, values) => {
        return (
          <TxLayout title="Send Tokens" step={values.activeStep}>
            <>
              <ProgressBar value={values.progress} />
              {Step}
            </>
          </TxLayout>
        )
      }}
    </TokenTransferStepper.Provider>
  )
}

export default TokenTransferFlow
