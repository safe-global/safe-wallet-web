import { type SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import { Button, Typography } from '@mui/material'
import ErrorToast from '@/components/common/ErrorToast'
import { ReactElement, useState } from 'react'
import { signTransaction } from '@/services/createTransaction'
import css from './styles.module.css'

const SignTx = ({ tx, onSubmit }: { tx: SafeTransaction; onSubmit: (tx: SafeTransaction) => void }): ReactElement => {
  const [error, setError] = useState<Error>()

  const onSign = async () => {
    try {
      const signedTx = await signTransaction(tx)
      onSubmit(signedTx)
    } catch (err) {
      setError(err as Error)
    }
  }

  return (
    <div className={css.container}>
      <Typography variant="h6">Needs signature</Typography>

      <pre style={{ overflow: 'auto', width: '100%' }}>{JSON.stringify(tx, null, 2)}</pre>

      <div className={css.submit}>
        <Button variant="contained" onClick={onSign}>
          Sign transaction
        </Button>
      </div>

      {error && <ErrorToast message={error.message} />}
    </div>
  )
}

export default SignTx
