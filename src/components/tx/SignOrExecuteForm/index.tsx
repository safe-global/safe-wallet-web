import { useContext } from 'react'
import useAsync from '@/hooks/useAsync'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import SignOrExecuteForm, { type SignOrExecuteProps } from './SignOrExecuteForm'
import SignOrExecuteSkeleton from './SignOrExecuteSkeleton'
import { useTxActions } from './hooks'

const useSafeTx = () => useContext(SafeTxContext)

type SignOrExecuteExtendedProps = Omit<SignOrExecuteProps, 'txId'> & { txId?: string }

const SignOrExecute = (props: SignOrExecuteExtendedProps) => {
  const { proposeTx } = useTxActions()
  const { safeTx } = useSafeTx()

  const [txDetails, isLoading] = useAsync(
    () => {
      if (!safeTx) return
      return proposeTx(safeTx, props.txId, props.origin)
    },
    [safeTx, props.txId, props.origin],
    false,
  )

  return isLoading || !txDetails ? (
    <SignOrExecuteSkeleton />
  ) : (
    <SignOrExecuteForm {...props} txId={props.txId ?? txDetails.txId} />
  )
}

export default SignOrExecute
