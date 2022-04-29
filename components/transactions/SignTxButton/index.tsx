import { type TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { Button } from '@mui/material'
import TxModal from '@/components/tx/TxModal'
import React, { useState, type ReactElement } from 'react'
import css from './styles.module.css'
import { TxStepperProps } from '@/components/tx/TxStepper'
import SignProposedTx from '@/components/tx/SignProposedTx'
import FinishTx from '@/components/tx/FinishTx'
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'

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

  const onClick = () => {
    setOpen(true)
  }

  return (
    <div className={css.container}>
      <Button onClick={onClick}>Sign</Button>

      {open && <TxModal onClose={() => setOpen(false)} steps={signTxSteps} initialData={[txSummary]} />}
    </div>
  )
}

export default SignTxButton
