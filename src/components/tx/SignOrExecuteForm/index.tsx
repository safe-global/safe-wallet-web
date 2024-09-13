import { useContext } from 'react'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import SignOrExecuteForm, { type SignOrExecuteProps } from './SignOrExecuteForm'
import SignOrExecuteSkeleton from './SignOrExecuteSkeleton'
import { useTxDetails } from './hooks'

const useSafeTx = () => useContext(SafeTxContext)

type SignOrExecuteExtendedProps = Omit<SignOrExecuteProps, 'txId'> & {
  txId?: string
}

export const SignOrExecute = (props: SignOrExecuteExtendedProps) => {
  const { safeTx } = useSafeTx()
  const [txDetails, _error, isLoading] = useTxDetails(safeTx, props.txId, props.origin)
  const isTxDetailsId = !txDetails && !props.txId

  return isLoading || isTxDetailsId || !safeTx ? (
    <SignOrExecuteSkeleton />
  ) : (
    <SignOrExecuteForm {...props} txId={props.txId ?? txDetails?.txId} />
  )
}

export default SignOrExecute
