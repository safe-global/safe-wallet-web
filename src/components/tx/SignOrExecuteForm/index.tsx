import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import SignOrExecuteForm from './SignOrExecuteForm'
import type { SignOrExecuteProps, SubmitCallback } from './SignOrExecuteForm'
import SignOrExecuteSkeleton from './SignOrExecuteSkeleton'
import { useTxDetails } from './hooks'
import { useContext } from 'react'

type SignOrExecuteExtendedProps = Omit<SignOrExecuteProps, 'txId'> & {
  onSubmit?: SubmitCallback
  txId?: string
  children?: React.ReactNode
  isExecutable?: boolean
  isRejection?: boolean
  isBatch?: boolean
  isBatchable?: boolean
  onlyExecute?: boolean
  disableSubmit?: boolean
  origin?: string
  isCreation?: boolean
  showMethodCall?: boolean
}

const SignOrExecute = (props: SignOrExecuteExtendedProps) => {
  const { safeTx } = useContext(SafeTxContext)
  const [txDetails, _error, isLoading] = useTxDetails(safeTx, props.txId, props.origin)
  const isTxDetailsId = !txDetails && !props.txId

  return isLoading || isTxDetailsId || !safeTx ? (
    <SignOrExecuteSkeleton />
  ) : (
    <SignOrExecuteForm {...props} txId={props.txId} txDetails={txDetails} />
  )
}

export default SignOrExecute
