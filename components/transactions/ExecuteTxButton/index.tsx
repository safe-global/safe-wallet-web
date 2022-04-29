import { type TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { Button } from '@mui/material'
import TxModal from '@/components/tx/TxModal'
import React, { useState, type ReactElement } from 'react'
import css from './styles.module.css'
import { TxStepperProps } from '@/components/tx/TxStepper'
import ExecuteProposedTx from '@/components/tx/ExecuteProposedTx'

const executeTxSteps: TxStepperProps['steps'] = [
  {
    label: 'Execute transaction',
    render: (data) => <ExecuteProposedTx txSummary={data as TransactionSummary} />,
  },
]

const ExecuteTxButton = ({ txSummary }: { txSummary: TransactionSummary }): ReactElement => {
  const [open, setOpen] = useState<boolean>(false)

  const onClick = () => {
    setOpen(true)
  }

  return (
    <div className={css.container}>
      <Button onClick={onClick}>Execute</Button>

      {open && <TxModal onClose={() => setOpen(false)} steps={executeTxSteps} initialData={[txSummary]} />}
    </div>
  )
}

export default ExecuteTxButton
