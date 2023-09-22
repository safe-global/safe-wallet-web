import { Alert, Button, Divider, SvgIcon, Typography } from '@mui/material'
import type { AlertColor } from '@mui/material'
import type { Web3WalletTypes } from '@walletconnect/web3wallet'
import type { Verify } from '@walletconnect/types'
import type { ComponentType } from 'react'

import { EIP155 } from '@/services/walletconnect/constants'
import useChains from '@/hooks/useChains'
import ChainIndicator from '@/components/common/ChainIndicator'
import { getEip155ChainId } from '@/services/walletconnect/utils'
import CloseIcon from '@/public/images/common/close.svg'
import InfoIcon from '@/public/images/notifications/info.svg'
import CheckIcon from '@/public/images/common/check.svg'
import AlertIcon from '@/public/images/notifications/alert.svg'
import type { Eip155ChainId } from '@/services/walletconnect/utils'

import css from './styles.module.css'
import SafeAppIconCard from '@/components/safe-apps/SafeAppIconCard'

const Validation: {
  [key in Verify.Context['verified']['validation']]: {
    color: AlertColor
    desc: string
    Icon: ComponentType
  }
} = {
  VALID: {
    color: 'success',
    desc: 'has been verified by WalletConnect.',
    Icon: CheckIcon,
  },
  UNKNOWN: {
    color: 'warning',
    desc: 'has not been verified by WalletConnect.',
    Icon: InfoIcon,
  },
  INVALID: {
    color: 'error',
    desc: 'has been flagged as a scam by WalletConnect. Only proceed if you trust this them.',
    Icon: CloseIcon,
  },
}

type ProposalFormProps = {
  proposal: Web3WalletTypes.SessionProposal
  onApprove?: () => void
  onReject?: () => void
}

const ProposalForm = ({ proposal, onApprove, onReject }: ProposalFormProps) => {
  const { configs } = useChains()
  const { requiredNamespaces, optionalNamespaces, proposer } = proposal.params
  const requiredChains = (requiredNamespaces[EIP155].chains as Array<Eip155ChainId>) ?? []
  const optionalChains = (optionalNamespaces[EIP155].chains as Array<Eip155ChainId>) ?? []

  const chainIds = configs
    .filter((chain) => {
      const eipChainId = getEip155ChainId(chain.chainId)
      return requiredChains.includes(eipChainId) || optionalChains.includes(eipChainId)
    })
    .map((chain) => chain.chainId)

  const { isScam, validation } = proposal.verifyContext.verified
  const _validation = Validation[validation]

  const color = isScam ? 'error' : _validation.color
  const Icon = isScam ? AlertIcon : _validation.Icon

  return (
    <div className={css.container}>
      <Typography variant="h4" fontWeight={700}>
        WalletConnect
      </Typography>

      <SafeAppIconCard src={proposer.metadata.icons[0]} width={32} height={32} alt={`${proposer.metadata.name} logo`} />

      <Typography>
        {proposer.metadata.name}
        <br />
        wants to connect
      </Typography>

      <Typography>{proposal.verifyContext.verified.origin}</Typography>

      <Divider flexItem />

      <div>
        <Typography mb={1}>Requested chains</Typography>
        <div>
          {chainIds.map((chainId) => (
            <ChainIndicator inline chainId={chainId} key={chainId} className={css.chain} />
          ))}
        </div>
      </div>

      <Divider flexItem />

      <div>
        <Typography mb={1}>Requested methods</Typography>
        <div>
          {requiredNamespaces[EIP155].methods.map((method) => (
            <span className={css.method} key={method}>
              {method}
            </span>
          ))}
        </div>
      </div>

      <Divider flexItem />

      <Alert
        severity={color}
        sx={{ bgcolor: ({ palette }) => palette[color].background }}
        className={css.alert}
        icon={
          <SvgIcon
            component={Icon}
            inheritViewBox
            color={color}
            sx={{
              '& path': {
                fill: ({ palette }) => palette[color].main,
              },
            }}
          />
        }
      >
        {isScam
          ? `We prevent connecting to ${proposer.metadata.name} as they are a known scam.`
          : `${proposer.metadata.name} ${_validation.desc}`}
      </Alert>

      <Button variant="text" size="small" fullWidth onClick={onReject}>
        Reject
      </Button>

      <Button variant="contained" size="small" fullWidth onClick={onApprove} disabled={isScam}>
        Approve
      </Button>
    </div>
  )
}

export default ProposalForm
