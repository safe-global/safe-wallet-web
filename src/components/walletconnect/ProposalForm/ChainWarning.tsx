import { Alert, Typography } from '@mui/material'
import { useMemo } from 'react'
import type { ReactElement } from 'react'
import type { Web3WalletTypes } from '@walletconnect/web3wallet'
import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'

import ChainIndicator from '@/components/common/ChainIndicator'
import useChains from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'
import { EIP155 } from '@/services/walletconnect/constants'
import { getEip155ChainId, stripEip155Prefix } from '@/services/walletconnect/utils'

import css from './styles.module.css'

const ChainInformation = {
  UNSUPPORTED:
    'This dApp does not support the Safe Account network. If you want to interact with it, please switch to a Safe Account on a supported network.',
  WRONG: (chainId: string, configs: Array<ChainInfo>, requiredChains: Array<string>) => {
    const safeChain = configs.find((chain) => chain.chainId === chainId)
    const safeChainName = safeChain?.chainName ?? ''

    let message: string | null = null

    if (requiredChains.length === 1) {
      const requiredChain = configs.find((chain) => chain.chainId === stripEip155Prefix(requiredChains[0]))
      const requiredChainName = requiredChain?.chainName ?? 'an unknown network'

      message = `The dApp requires the wallet to support ${requiredChainName}, but the current Safe Account is on ${safeChainName}.`
    } else {
      message = 'The dApp requires the wallet to support networks that differ to that of the Safe Account.'
    }

    return `${message} Once connected, we'll try to switch the dApp to ${safeChainName}.`
  },
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

  const { requiredNamespaces } = proposal.params

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const requiredChains = requiredNamespaces[EIP155]?.chains ?? []

  const chainIds = useMemo(() => getSupportedChainIds(configs, proposal), [configs, proposal])

  const supportsSafe = chainIds.includes(safe.chainId)
  const isCorrectChain = requiredChains.includes(getEip155ChainId(safe.chainId))

  const message = useMemo(() => {
    if (!supportsSafe) {
      return ChainInformation.UNSUPPORTED
    }
    return ChainInformation.WRONG(safe.chainId, configs, requiredChains)
  }, [configs, requiredChains, safe.chainId, supportsSafe])

  if (supportsSafe && isCorrectChain) {
    return null
  }

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
