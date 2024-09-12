import { useContext } from 'react'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import SignOrExecuteForm, { useSafeTxError, type SignOrExecuteProps } from './SignOrExecuteForm'
import SignOrExecuteSkeleton from './SignOrExecuteSkeleton'
import { useTxDetails } from './hooks'
import useChainId from '@/hooks/useChainId'

const useSafeTx = () => useContext(SafeTxContext)

type SignOrExecuteExtendedProps = Omit<SignOrExecuteProps, 'txId'> & {
  txId?: string
  chainId: ReturnType<typeof useChainId>
  safeTxError: ReturnType<typeof useSafeTxError>
}

export const SignOrExecute = (props: SignOrExecuteExtendedProps) => {
  const { safeTx } = useSafeTx()
  const [txDetails, _error, isLoading] = useTxDetails(safeTx, props.txId, props.origin)

  return isLoading || !txDetails ? (
    <SignOrExecuteSkeleton />
  ) : (
    <SignOrExecuteForm {...props} txId={props.txId ?? txDetails.txId} />
  )
}

export default SignOrExecute
