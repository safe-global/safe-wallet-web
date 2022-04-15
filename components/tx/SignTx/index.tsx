import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import { Button, Typography } from '@mui/material'
import { ReactElement } from 'react'
import { signTransaction } from 'services/createTransaction'
import css from './styles.module.css'

const SignTx = ({ data, onSubmit }: { data: unknown; onSubmit: (tx: SafeTransaction) => void }): ReactElement => {
  const tx: SafeTransaction = data as SafeTransaction

  const onSign = async () => {
    const signedTx = await signTransaction(tx)
    onSubmit(signedTx)
  }

  return (
    <div className={css.container}>
      <Typography variant="h6">Needs signature</Typography>

      <pre>{JSON.stringify(tx, null, 2)}</pre>

      <div className={css.submit}>
        <Button variant="contained" onClick={onSign}>
          Sign transaction
        </Button>
      </div>
    </div>
  )
}

export default SignTx
