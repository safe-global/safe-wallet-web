import { type SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import { Typography } from '@mui/material'
import { type ReactElement } from 'react'
import css from './styles.module.css'

const ExecuteTx = ({ tx }: { tx: SafeTransaction }): ReactElement => {
  return (
    <div className={css.container}>
      <Typography variant="h6">All done!</Typography>

      <pre style={{ overflow: 'auto', width: '100%' }}>
        {JSON.stringify(
          {
            ...tx,
            signatures: Object.fromEntries(tx.signatures.entries()),
          },
          null,
          2,
        )}
      </pre>
    </div>
  )
}

export default ExecuteTx
