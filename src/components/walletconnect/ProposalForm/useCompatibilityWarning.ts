import { useMemo } from 'react'
import type { AlertColor } from '@mui/material'
import type { Web3WalletTypes } from '@walletconnect/web3wallet'

import useChains from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'
import { isStrictAddressBridge, isDefaultAddressBridge } from './bridges'

const NAME_PLACEHOLDER = '%%name%%'
const CHAIN_PLACEHOLDER = '%%chain%%'

const Warnings: Record<string, { severity: AlertColor; message: string }> = {
  BLOCKED_BRIDGE: {
    severity: 'error',
    message: `${NAME_PLACEHOLDER} is a bridge that is unusable in Safe{Wallet} due to the current implementation of WalletConnect — the bridged funds will be lost. Consider using a different bridge.`,
  },
  WARNED_BRIDGE: {
    severity: 'warning',
    message: `While using ${NAME_PLACEHOLDER}, please make sure that the desination address you send funds to matches the Safe address you have on the respective chain. Otherwise, the funds will be lost.`,
  },
  UNSUPPORTED_CHAIN: {
    severity: 'error',
    message: `${NAME_PLACEHOLDER} does not support the Safe Account network. If you want to interact with ${NAME_PLACEHOLDER}, please switch to a Safe Account on a supported network.`,
  },
  WRONG_CHAIN: {
    severity: 'info',
    message: `Please make sure that the dApp is connected to ${CHAIN_PLACEHOLDER}.`,
  },
}

export const useCompatibilityWarning = (
  proposal: Web3WalletTypes.SessionProposal,
  isUnsupportedChain: boolean,
): (typeof Warnings)[string] => {
  const { configs } = useChains()
  const { safe } = useSafeInfo()

  return useMemo(() => {
    const { origin } = proposal.verifyContext.verified
    const { proposer } = proposal.params

    let { message, severity } = isStrictAddressBridge(origin)
      ? Warnings.BLOCKED_BRIDGE
      : isDefaultAddressBridge(origin)
      ? Warnings.WARNED_BRIDGE
      : isUnsupportedChain
      ? Warnings.UNSUPPORTED_CHAIN
      : Warnings.WRONG_CHAIN

    if (message.includes(NAME_PLACEHOLDER)) {
      message = message.replaceAll(NAME_PLACEHOLDER, proposer.metadata.name)
    }

    if (message.includes(CHAIN_PLACEHOLDER)) {
      const chainName = configs.find((chain) => chain.chainId === safe.chainId)?.chainName ?? 'this network'
      message = message.replaceAll(CHAIN_PLACEHOLDER, chainName)
    }

    return {
      message,
      severity,
    }
  }, [configs, isUnsupportedChain, proposal.params, proposal.verifyContext.verified, safe.chainId])
}
