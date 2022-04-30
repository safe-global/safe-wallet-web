import { type TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { Button } from '@mui/material'
import TxModal from '@/components/tx/TxModal'
import React, { useState, type ReactElement } from 'react'
import css from './styles.module.css'
import { TxStepperProps } from '@/components/tx/TxStepper'
import SignProposedTx from '@/components/tx/SignProposedTx'
import FinishTx from '@/components/tx/FinishTx'
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import { isOwner, isSignaturePending } from '@/components/transactions/utils'
import useWallet from '@/services/wallets/useWallet'
import useSafeInfo from '@/services/useSafeInfo'

const signTxSteps: TxStepperProps['steps'] = [
  {
    label: 'Sign transaction',
    render: (data, onSubmit) => <SignProposedTx txSummary={data as TransactionSummary} onSubmit={onSubmit} />,
  },
  {
    label: 'Done',
    render: (data) => <FinishTx tx={data as SafeTransaction} />,
  },
]

const SignTxButton = ({ txSummary }: { txSummary: TransactionSummary }): ReactElement => {
  const [open, setOpen] = useState<boolean>(false)
  const { safe } = useSafeInfo()
  const wallet = useWallet()
  const signaturePending = isSignaturePending(txSummary, wallet?.address)
  const granted = isOwner(safe?.owners, wallet?.address)

  const onClick = () => {
    setOpen(true)
  }

  const isDisabled = !signaturePending || !granted

  return (
    <div className={css.container}>
      <Button onClick={onClick} disabled={isDisabled}>
        Sign
      </Button>

      {open && <TxModal onClose={() => setOpen(false)} steps={signTxSteps} initialData={[txSummary]} />}
    </div>
  )
}

export default SignTxButton
