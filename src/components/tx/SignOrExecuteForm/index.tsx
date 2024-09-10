import useAsync from '@/hooks/useAsync'
import SignOrExecuteForm, { type SignOrExecuteProps } from './SignOrExecuteForm'
import { useTxActions } from './hooks'
import { useContext } from 'react'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'

const useSafeTx = () => useContext(SafeTxContext)

const SignOrExecute = (props: Omit<SignOrExecuteProps, 'txId'> & { txId?: string }) => {
  const { proposeTx } = useTxActions()
  const { safeTx } = useSafeTx()

  const [txDetails, isLoading] = useAsync(() => {
    if (!safeTx) return
    return proposeTx(safeTx, props.txId, props.origin)
  }, [safeTx, props.txId, props.origin])

  return isLoading || !txDetails ? <>Loading</> : <SignOrExecuteForm {...props} txId={props.txId ?? txDetails.txId} />
}

export default SignOrExecute
