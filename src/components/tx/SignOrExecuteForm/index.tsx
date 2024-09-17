import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import SignOrExecuteForm from './SignOrExecuteForm'
import type { SignOrExecuteProps, SubmitCallback } from './SignOrExecuteForm'
import SignOrExecuteSkeleton from './SignOrExecuteSkeleton'
import { useProposeTx } from './hooks'
import { useContext } from 'react'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import TxCard from '@/components/tx-flow/common/TxCard'
import useSafeInfo from '@/hooks/useSafeInfo'

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
  const { safe } = useSafeInfo()
  const [txDetails, error, isLoading] = useProposeTx(safe.deployed ? safeTx : undefined, props.txId, props.origin)

  return error ? (
    <TxCard>
      <ErrorBoundary error={error} componentStack="SignOrExecuteForm/index" />
    </TxCard>
  ) : isLoading || !safeTx || (!txDetails && safe.deployed) ? (
    <SignOrExecuteSkeleton />
  ) : (
    <SignOrExecuteForm {...props} isCreation={!props.txId} txId={props.txId || txDetails?.txId} txDetails={txDetails} />
  )
}

export default SignOrExecute
