import { Alert, AlertTitle, Typography } from '@mui/material'
import type { ReactElement } from 'react'

import ChainIndicator from '@/components/common/ChainIndicator'

import css from './styles.module.css'

export const UnsupportedChain = ({ chainIds }: { chainIds: Array<string> }): ReactElement => {
  return (
    <>
      <Alert severity="info" className={css.alert}>
        <AlertTitle>dApp does not support Safe network</AlertTitle>
        If you want to interact with this dApp, please switch to a Safe on a supported network.
      </Alert>

      <Typography mt={3} mb={1}>
        Supported chains
      </Typography>

      <div>
        {chainIds.map((chainId) => (
          <ChainIndicator inline chainId={chainId} key={chainId} className={css.chain} />
        ))}
      </div>
    </>
  )
}
