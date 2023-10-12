import { Alert, Typography } from '@mui/material'
import { useMemo } from 'react'
import type { ReactElement } from 'react'
import type { Web3WalletTypes } from '@walletconnect/web3wallet'
import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'

import ChainIndicator from '@/components/common/ChainIndicator'
import useChains from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'
import { EIP155 } from '@/services/walletconnect/constants'
import { getEip155ChainId } from '@/services/walletconnect/utils'

import css from './styles.module.css'

const ChainInformation = {
  UNSUPPORTED:
    'This dApp does not support the Safe Account network. If you want to interact with it, please switch to a Safe Account on a supported network.',
  WRONG: 'Please make sure that the dApp is connected to %%chain%%.',
}

const getSupportedChainIds = (configs: Array<ChainInfo>, proposal: Web3WalletTypes.SessionProposal): Array<string> => {
  const { requiredNamespaces, optionalNamespaces } = proposal.params

  const requiredChains = requiredNamespaces[EIP155]?.chains ?? []
  const optionalChains = optionalNamespaces[EIP155]?.chains ?? []

  return configs
    .filter((chain) => {
      const eipChainId = getEip155ChainId(chain.chainId)
      return requiredChains.includes(eipChainId) || optionalChains.includes(eipChainId)
    })
    .map((chain) => chain.chainId)
}

export const ChainWarning = ({ proposal }: { proposal: Web3WalletTypes.SessionProposal }): ReactElement | null => {
  const { configs } = useChains()
  const { safe } = useSafeInfo()

  const chainIds = useMemo(() => getSupportedChainIds(configs, proposal), [configs, proposal])
  const supportsSafe = chainIds.includes(safe.chainId)

  const requiredChains = proposal.params.requiredNamespaces[EIP155]?.chains ?? []
  const isCorrectChain = requiredChains.includes(getEip155ChainId(safe.chainId))

  if (supportsSafe && isCorrectChain) {
    return null
  }

  if (supportsSafe) {
    const chainName = configs.find((chain) => chain.chainId === safe.chainId)?.chainName ?? ''
    ChainInformation.WRONG = ChainInformation.WRONG.replace('%%chain%%', chainName)
  }

  const message = supportsSafe ? ChainInformation.WRONG : ChainInformation.UNSUPPORTED

  return (
    <>
      <Alert severity="info" className={css.alert}>
        {message}
      </Alert>

      {!supportsSafe && (
        <>
          <Typography mt={3} mb={1}>
            Supported chains
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
