import { Alert, Typography } from '@mui/material'
import type { AlertColor } from '@mui/material'
import type { ReactElement } from 'react'
import type { Web3WalletTypes } from '@walletconnect/web3wallet'

import ChainIndicator from '@/components/common/ChainIndicator'
import useChains from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'
import { EIP155 } from '@/services/walletconnect/constants'
import { getEip155ChainId } from '@/services/walletconnect/utils'

import css from './styles.module.css'

const ChainInformation: Record<string, { severity: AlertColor; message: string }> = {
  UNSUPPORTED: {
    severity: 'error',
    message:
      'This dApp does not support the Safe Account network. If you want to interact with this dApp, please switch to a Safe Account on a supported network.',
  },
  WRONG: {
    severity: 'info',
    message: 'Please make sure that the dApp is connected to %%chain%%.',
  },
}

export const ChainWarning = ({
  proposal,
  chainIds,
}: {
  proposal: Web3WalletTypes.SessionProposal
  chainIds: Array<string>
}): ReactElement | null => {
  const { configs } = useChains()
  const { safe } = useSafeInfo()

  const supportsCurrentChain = chainIds.includes(safe.chainId)

  const requiredChains = proposal.params.requiredNamespaces[EIP155]?.chains ?? []
  const isCorrectChain = requiredChains.includes(getEip155ChainId(safe.chainId))

  if (supportsCurrentChain && isCorrectChain) {
    return null
  }

  if (supportsCurrentChain) {
    const chainName = configs.find((chain) => chain.chainId === safe.chainId)?.chainName ?? ''
    ChainInformation.WRONG.message = ChainInformation.WRONG.message.replace('%%chain%%', chainName)
  }

  const { severity, message } = supportsCurrentChain ? ChainInformation.WRONG : ChainInformation.UNSUPPORTED

  return (
    <>
      <Alert severity={severity} className={css.alert}>
        {message}
      </Alert>

      {!supportsCurrentChain && (
        <>
          <Typography mt={3} mb={1}>
            Supported networks
          </Typography>

          <div>
            {chainIds.map((chainId) => (
              <ChainIndicator inline chainId={chainId} key={chainId} className={css.chain} />
            ))}
          </div>
        </>
      )}
    </>
  )
}
