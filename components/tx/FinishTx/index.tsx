import { type SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import { Typography } from '@mui/material'
import ErrorToast from 'components/common/ErrorToast'
import { useEffect, useState, type ReactElement } from 'react'
import proposeTx from 'services/proposeTransaction'
import useSafeAddress from 'services/useSafeAddress'
import css from './styles.module.css'

const FinishTx = ({ tx }: { tx: SafeTransaction }): ReactElement => {
  const { address, chainId } = useSafeAddress()
  const [error, setError] = useState<Error>()

  useEffect(() => {
    proposeTx(chainId, address, tx).catch(setError)
  }, [chainId, address, tx])

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

      {error && <ErrorToast message={error.message} />}
    </div>
  )
}

export default FinishTx
