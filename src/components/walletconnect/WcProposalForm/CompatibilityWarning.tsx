import { Alert, Typography } from '@mui/material'
import type { ReactElement } from 'react'
import type { Web3WalletTypes } from '@walletconnect/web3wallet'

import ChainIndicator from '@/components/common/ChainIndicator'
import { useCompatibilityWarning } from './useCompatibilityWarning'
import useSafeInfo from '@/hooks/useSafeInfo'

import css from './styles.module.css'
import NetworkSelector from '@/components/common/NetworkSelector'

export const CompatibilityWarning = ({
  proposal,
  chainIds,
}: {
  proposal: Web3WalletTypes.SessionProposal
  chainIds: Array<string>
}): ReactElement => {
  const { safe } = useSafeInfo()
  const isUnsupportedChain = !chainIds.includes(safe.chainId)
  const { severity, message } = useCompatibilityWarning(proposal, isUnsupportedChain)

  return (
    <>
      <Alert severity={severity} className={css.alert}>
        {message}
      </Alert>

      {isUnsupportedChain && (
        <>
          <Typography mt={3} mb={1}>
            Supported networks
          </Typography>

          <div>
            {chainIds.map((chainId) => (
              <ChainIndicator inline chainId={chainId} key={chainId} className={css.chain} />
            ))}
          </div>

          <Typography mt={3} component="div">
            Switch network
            <NetworkSelector />
          </Typography>
        </>
      )}
    </>
  )
}
