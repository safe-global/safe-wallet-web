import { useState, type ReactElement } from 'react'
import { Box, Link, Step, StepConnector, StepLabel, Stepper, type StepProps } from '@mui/material'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

import useWallet from '@/hooks/wallets/useWallet'
import EthHashInfo from '@/components/common/EthHashInfo'
import useIsMsgPending from '@/hooks/useIsMsgPending'
import useIsMessageSignableBy from '@/hooks/useIsMsgSignableBy'
import type { Message } from '@/hooks/useMessages'

import css from '@/components/messages/MsgSigners/styles.module.css'
import txSignersCss from '@/components/transactions/TxSigners/styles.module.css'

// Icons

const DotIcon = () => <FiberManualRecordIcon className={txSignersCss.icon} />

const StyledStep = ({
  $bold,
  sx,
  ...rest
}: {
  $bold?: boolean
} & StepProps) => (
  <Step
    className={css.step}
    sx={{
      '.MuiStepLabel-label': {
        fontWeight: `${$bold ? 'bold' : 'normal'} !important`,
      },
    }}
    {...rest}
  />
)

const shouldHideConfirmations = (msg: Message): boolean => {
  const confirmationsNeeded = msg.confirmationsRequired - msg.confirmationsSubmitted
  const isConfirmed = confirmationsNeeded <= 0

  // Threshold reached or more than 3 confirmations
  return isConfirmed || msg.confirmations.length > 3
}

export const MsgSigners = ({ msg }: { msg: Message }): ReactElement => {
  const [hideConfirmations, setHideConfirmations] = useState<boolean>(shouldHideConfirmations(msg))
  const isPending = useIsMsgPending(msg.messageHash)
  const wallet = useWallet()

  const toggleHide = () => {
    setHideConfirmations((prev) => !prev)
  }

  const { confirmations, confirmationsRequired, confirmationsSubmitted } = msg

  const canSign = useIsMessageSignableBy(msg, wallet?.address || '')
  const confirmationsNeeded = confirmationsRequired - confirmationsSubmitted
  const isConfirmed = confirmationsNeeded <= 0 || isPending || canSign

  return (
    <Stepper
      orientation="vertical"
      nonLinear
      connector={<StepConnector sx={{ padding: '3px 0' }} />}
      className={txSignersCss.stepper}
    >
      <StyledStep $bold>
        <StepLabel icon={<AddCircleIcon className={txSignersCss.icon} />}>Created</StepLabel>
      </StyledStep>
      <StyledStep $bold>
        <StepLabel icon={<CheckCircleIcon className={txSignersCss.icon} />}>
          Confirmations{' '}
          <Box className={txSignersCss.confirmationsTotal}>
            ({`${confirmationsSubmitted} of ${confirmationsRequired}`})
          </Box>
        </StepLabel>
      </StyledStep>
      {!hideConfirmations &&
        confirmations.map(({ owner }) => (
          <StyledStep key={owner.value}>
            <StepLabel icon={<DotIcon />}>
              <EthHashInfo address={owner.value} name={owner.name} hasExplorer showCopyButton />
            </StepLabel>
          </StyledStep>
        ))}
      {confirmations.length > 0 && (
        <StyledStep>
          <StepLabel icon={<DotIcon />}>
            <Link component="button" onClick={toggleHide} fontSize="medium">
              {hideConfirmations ? 'Show all' : 'Hide all'}
            </Link>
          </StepLabel>
        </StyledStep>
      )}
      {isConfirmed && (
        <StyledStep expanded>
          <StepLabel icon={<DotIcon />} sx={{ marginBottom: 1, fontWeight: 'bold' }}>
            Confirmed
          </StepLabel>
        </StyledStep>
      )}
    </Stepper>
  )
}

export default MsgSigners
