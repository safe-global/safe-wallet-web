import type { Web3WalletTypes } from '@walletconnect/web3wallet'
import { Alert, SvgIcon } from '@mui/material'
import type { AlertColor } from '@mui/material'
import AlertIcon from '@/public/images/notifications/alert.svg'

import type { Verify } from '@walletconnect/types'
import type { ComponentType } from 'react'
import CloseIcon from '@/public/images/common/close.svg'
import InfoIcon from '@/public/images/notifications/info.svg'
import CheckIcon from '@/public/images/common/check.svg'
import css from './styles.module.css'

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

const ProposalVerification = ({ proposal }: { proposal: Web3WalletTypes.SessionProposal }) => {
  const { proposer } = proposal.params
  const { isScam, validation } = proposal.verifyContext.verified
  const _validation = Validation[validation]
  const color = isScam ? 'error' : _validation.color
  const Icon = isScam ? AlertIcon : _validation.Icon

  return (
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
  )
}
export default ProposalVerification
