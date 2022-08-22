import { useMemo, useState, type ReactElement } from 'react'
import { Box, Link, Palette, Step, StepConnector, StepContent, StepLabel, Stepper, type StepProps } from '@mui/material'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import RadioButtonUncheckedOutlinedIcon from '@mui/icons-material/RadioButtonUncheckedOutlined'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import type {
  AddressEx,
  DetailedExecutionInfo,
  MultisigConfirmation,
  TransactionDetails,
  TransactionSummary,
} from '@gnosis.pm/safe-react-gateway-sdk'

import useWallet from '@/hooks/wallets/useWallet'
import useIsPending from '@/hooks/useIsPending'
import { isCancellationTxInfo, isExecutable, isMultisigExecutionDetails } from '@/utils/transaction-guards'
import EthHashInfo from '@/components/common/EthHashInfo'

import css from './styles.module.css'

// Icons

const TxCreationIcon = () => <AddCircleIcon className={css.icon} />
const TxRejectionIcon = () => <CancelIcon className={css.icon} />
const CheckIcon = () => <CheckCircleIcon className={css.icon} />

const CircleIcon = () => (
  <RadioButtonUncheckedOutlinedIcon className={css.icon} sx={{ stroke: 'currentColor', strokeWidth: '1px' }} />
)
const DotIcon = () => <FiberManualRecordIcon className={css.icon} />

enum StepState {
  CONFIRMED = 'CONFIRMED',
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
  ERROR = 'ERROR',
}

const getStepColor = (state: StepState, palette: Palette): string => {
  const colors: { [key in StepState]: string } = {
    [StepState.CONFIRMED]: palette.primary.main,
    [StepState.ACTIVE]: palette.warning.dark,
    [StepState.DISABLED]: palette.border.main,
    [StepState.ERROR]: palette.error.main,
  }
  return colors[state]
}

type StyledStepProps = {
  $bold?: boolean
  $state: StepState
}
const StyledStep = ({ $bold, $state, sx, ...rest }: StyledStepProps & StepProps) => (
  <Step
    sx={({ palette }) => ({
      '.MuiStepLabel-label': {
        fontWeight: `${$bold ? 'bold' : 'normal'} !important`,
        color: `${getStepColor($state, palette)} !important`,
        fontSize: '16px !important',
      },
      '.MuiStepLabel-iconContainer': {
        color: getStepColor($state, palette),
        alignItems: 'center',
      },
    })}
    {...rest}
  />
)

const shouldHideConfirmations = (detailedExecutionInfo?: DetailedExecutionInfo): boolean => {
  if (!detailedExecutionInfo || !isMultisigExecutionDetails(detailedExecutionInfo)) {
    return true
  }

  const confirmationsNeeded = detailedExecutionInfo.confirmationsRequired - detailedExecutionInfo.confirmations.length
  const isConfirmed = confirmationsNeeded <= 0

  // Threshold reached or more than 3 confirmations
  return isConfirmed || detailedExecutionInfo.confirmations.length > 3
}

const getConfirmationStep = ({ value, name }: AddressEx, key: string | undefined = undefined): ReactElement => (
  <StyledStep key={key} $state={StepState.CONFIRMED}>
    <StepLabel icon={<DotIcon />}>
      <EthHashInfo address={value} name={name} hasExplorer showCopyButton />
    </StepLabel>
  </StyledStep>
)

export const TxSigners = ({
  txDetails,
  txSummary,
}: {
  txDetails: TransactionDetails
  txSummary: TransactionSummary
}): ReactElement | null => {
  const { detailedExecutionInfo, txInfo, txId } = txDetails
  const [hideConfirmations, setHideConfirmations] = useState<boolean>(shouldHideConfirmations(detailedExecutionInfo))
  const isPending = useIsPending(txId)
  const wallet = useWallet()

  const toggleHide = () => {
    setHideConfirmations((prev) => !prev)
  }

  // If final signer executes tx, `detailedExecutionInfo.confirmations` won't contain their confirmation
  const confirmations = useMemo(() => {
    if (!isMultisigExecutionDetails(detailedExecutionInfo)) {
      return []
    }

    const isOwner = detailedExecutionInfo.signers.some((signer) => signer.value === wallet?.address)
    const hasConfirmation = detailedExecutionInfo.confirmations.some(({ signer }) => signer.value === wallet?.address)

    if (isPending && isOwner && !hasConfirmation) {
      const EXECUTOR_CONFIRMATION: MultisigConfirmation = {
        signer: { value: wallet?.address || '' },
        submittedAt: Date.now(),
      }

      return [...detailedExecutionInfo.confirmations, EXECUTOR_CONFIRMATION]
    }

    return detailedExecutionInfo.confirmations
  }, [
    isPending,
    wallet?.address,
    isMultisigExecutionDetails(detailedExecutionInfo) && detailedExecutionInfo.confirmations,
  ])

  if (!detailedExecutionInfo || !isMultisigExecutionDetails(detailedExecutionInfo)) {
    return null
  }

  const canExecute = wallet?.address ? isExecutable(txSummary, wallet.address) : false
  const confirmationsNeeded = detailedExecutionInfo.confirmationsRequired - detailedExecutionInfo.confirmations.length
  const isConfirmed = confirmationsNeeded <= 0 || isPending || canExecute
  const isExecuted = !!detailedExecutionInfo.executor

  return (
    <Stepper
      orientation="vertical"
      nonLinear
      connector={<StepConnector sx={{ padding: '3px 0' }} />}
      className={css.stepper}
    >
      {isCancellationTxInfo(txInfo) ? (
        <StyledStep $bold $state={StepState.ERROR}>
          <StepLabel icon={<TxRejectionIcon />}>On-chain rejection created</StepLabel>
        </StyledStep>
      ) : (
        <StyledStep $bold $state={StepState.CONFIRMED}>
          <StepLabel icon={<TxCreationIcon />}>Created</StepLabel>
        </StyledStep>
      )}
      <StyledStep $bold $state={isConfirmed ? StepState.CONFIRMED : StepState.ACTIVE}>
        <StepLabel icon={isConfirmed ? <CheckIcon /> : <CircleIcon />}>
          Confirmations{' '}
          <Box className={css.confirmationsTotal}>
            ({`${confirmations.length} of ${detailedExecutionInfo.confirmationsRequired}`})
          </Box>
        </StepLabel>
      </StyledStep>
      {!hideConfirmations && confirmations.map(({ signer }) => getConfirmationStep(signer, signer.value))}
      {confirmations.length > 0 && (
        <StyledStep $state={StepState.CONFIRMED}>
          <StepLabel icon={<DotIcon />}>
            <Link component="button" onClick={toggleHide} fontSize="medium">
              {hideConfirmations ? 'Show all' : 'Hide all'}
            </Link>
          </StepLabel>
        </StyledStep>
      )}
      <StyledStep expanded $bold $state={isExecuted ? StepState.CONFIRMED : StepState.DISABLED}>
        <StepLabel icon={isExecuted ? <CheckIcon /> : <CircleIcon />} sx={{ marginBottom: 1, fontWeight: 'bold' }}>
          {isExecuted ? 'Executed' : isPending ? 'Executing' : 'Execution'}
        </StepLabel>
        {
          // isExecuted
          detailedExecutionInfo.executor ? (
            <StepContent>
              <EthHashInfo
                address={detailedExecutionInfo.executor.value}
                name={detailedExecutionInfo.executor.name}
                customAvatar={detailedExecutionInfo.executor.logoUri}
                hasExplorer
                showCopyButton
              />
            </StepContent>
          ) : (
            !isConfirmed && (
              <StepContent sx={({ palette }) => ({ color: palette.border.main })}>
                Can be executed once the threshold is reached
              </StepContent>
            )
          )
        }
      </StyledStep>
    </Stepper>
  )
}

export default TxSigners
