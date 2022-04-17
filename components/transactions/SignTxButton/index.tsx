import { type TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { Button } from '@mui/material'
import TxModal from 'components/tx/TxModal'
import { useState, type ReactElement } from 'react'
import css from './styles.module.css'

const SignTxButton = ({ txSummary }: { txSummary: TransactionSummary }): ReactElement => {
  const [signing, setSigning] = useState<boolean>(false)

  const onClick = () => {
    setSigning(true)
  }

  return (
    <div className={css.container}>
      <Button onClick={onClick}>Sign</Button>

      {signing && <TxModal onClose={() => setSigning(false)} txSummary={txSummary} />}
    </div>
  )
}

export default SignTxButton
