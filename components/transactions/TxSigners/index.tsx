import Step, { StepProps } from '@mui/material/Step'
import StepConnector from '@mui/material/StepConnector'
import StepContent from '@mui/material/StepContent'
import StepLabel from '@mui/material/StepLabel'
import Stepper from '@mui/material/Stepper'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import RadioButtonUncheckedOutlinedIcon from '@mui/icons-material/RadioButtonUncheckedOutlined'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import { useState, type ReactElement } from 'react'
import type { AddressEx, DetailedExecutionInfo, TransactionDetails } from '@gnosis.pm/safe-react-gateway-sdk'

import useSafeInfo from '@/services/useSafeInfo'
import useWallet from '@/services/wallets/useWallet'
import useAddressBook from '@/services/useAddressBook'
import useIsPending from '@/components/transactions/useIsPending'
import { isCancellationTxInfo, isMultisigExecutionDetails } from '@/components/transactions/utils'

import css from './styles.module.css'

const black300 = '#B2BBC0'
const gray500 = '#E2E3E3'
const primary400 = '#008C73'
const red400 = '#C31717'
const orange500 = '#e8663d'

// Icons

const TxCreationIcon = () => <AddCircleIcon className={css.icon} />
const TxRejectionIcon = () => <CancelIcon className={css.icon} />
const CheckIcon = () => <CheckCircleIcon className={css.icon} />

const CircleIcon = () => (
  <RadioButtonUncheckedOutlinedIcon className={css.icon} sx={{ stroke: 'currentColor', strokeWidth: '1px' }} />
)
const DotIcon = () => <FiberManualRecordIcon className={css.icon} sx={{ height: '14px', width: '14px' }} />

type StepState = 'confirmed' | 'active' | 'disabled' | 'error'
const getStepColor = (state: StepState): string => {
  const colors = {
    confirmed: primary400,
    active: orange500,
    disabled: black300,
    error: red400,
  }
  return colors[state]
}

type StyledStepProps = {
  $bold?: boolean
  $state: StepState
}
const StyledStep = ({ $bold, $state, children, sx, ...rest }: StyledStepProps & StepProps) => (
  <Step
    sx={{
      '.MuiStepLabel-label': {
        fontWeight: `${$bold ? 'bold' : 'normal'} !important`,
        fontSize: '16px !important',
        color: `${getStepColor($state)} !important`,
      },
      '.MuiStepLabel-iconContainer': {
        color: getStepColor($state),
        alignItems: 'center',
      },
      ...sx,
    }}
    {...rest}
  >
    {children}
  </Step>
)

const shouldHideConfirmations = (detailedExecutionInfo: DetailedExecutionInfo | null): boolean => {
  if (!detailedExecutionInfo || !isMultisigExecutionDetails(detailedExecutionInfo)) {
    return true
  }

  const confirmationsNeeded = detailedExecutionInfo.confirmationsRequired - detailedExecutionInfo.confirmations.length
  const isConfirmed = confirmationsNeeded <= 0

  // Threshold reached or more than 3 confirmations
  return isConfirmed || detailedExecutionInfo.confirmations.length > 3
}

// TODO: Create an AddressInfo component
const AddressInfo = ({ address, name, avatarUrl, shortenHash }: any): ReactElement => <>{name || address}</>

const getConfirmationStep = (
  { value, name, logoUri }: AddressEx,
  key: string | undefined = undefined,
): ReactElement => (
  <StyledStep key={key} $bold $state="confirmed">
    <StepLabel icon={<DotIcon />}>
      <AddressInfo address={value} name={name} avatarUrl={logoUri} shortenHash={4} />
    </StepLabel>
  </StyledStep>
)

export const TxSigners = ({ txDetails }: { txDetails: TransactionDetails }): ReactElement | null => {
  const { detailedExecutionInfo, txInfo, txId } = txDetails
  const [hideConfirmations, setHideConfirmations] = useState<boolean>(shouldHideConfirmations(detailedExecutionInfo))
  const isPending = useIsPending({ txId })
  const { safe } = useSafeInfo()
  const wallet = useWallet()
  const account = wallet?.address || ''
  const { [account]: name } = useAddressBook()

  const toggleHide = () => {
    setHideConfirmations((prev) => !prev)
  }

  if (!detailedExecutionInfo || !isMultisigExecutionDetails(detailedExecutionInfo)) {
    return null
  }

  const isImmediateExecution = isPending && safe?.threshold === 1
  const confirmationsNeeded = detailedExecutionInfo.confirmationsRequired - detailedExecutionInfo.confirmations.length
  const isConfirmed = confirmationsNeeded <= 0 || isImmediateExecution
  const isExecuted = !!detailedExecutionInfo.executor

  const numberOfConfirmations = isImmediateExecution ? 1 : detailedExecutionInfo.confirmations.length

  return (
    <Stepper
      orientation="vertical"
      nonLinear
      connector={
        <StepConnector
          sx={{
            padding: '3px 0',
            '.MuiStepConnector-line': {
              marginLeft: '-3px',
              borderColor: gray500,
              borderLeftWidth: '2px',
              minHeight: '14px',
            },
          }}
        />
      }
      sx={{ padding: 0 }}
    >
      {isCancellationTxInfo(txInfo) ? (
        <StyledStep $bold $state="error">
          <StepLabel icon={<TxRejectionIcon />}>On-chain rejection created</StepLabel>
        </StyledStep>
      ) : (
        <StyledStep $bold $state="confirmed">
          <StepLabel icon={<TxCreationIcon />}>Created</StepLabel>
        </StyledStep>
      )}
      <StyledStep $bold $state={isConfirmed ? 'confirmed' : 'active'}>
        <StepLabel icon={isConfirmed ? <CheckIcon /> : <CircleIcon />}>
          Confirmations{' '}
          <span
            style={{
              color: black300,
              fontWeight: 'normal',
            }}
          >
            ({`${numberOfConfirmations} of ${detailedExecutionInfo.confirmationsRequired}`})
          </span>
        </StepLabel>
      </StyledStep>
      {!hideConfirmations &&
        (isImmediateExecution
          ? getConfirmationStep({ value: account, name, logoUri: null })
          : detailedExecutionInfo.confirmations.map(({ signer }) => getConfirmationStep(signer, signer.value)))}
      {detailedExecutionInfo.confirmations.length > 0 && (
        <StyledStep $state="confirmed">
          <StepLabel icon={<DotIcon />} onClick={toggleHide}>
            <span
              style={{
                cursor: 'pointer',
              }}
            >
              {hideConfirmations ? 'Show all' : 'Hide all'}
            </span>
          </StepLabel>
        </StyledStep>
      )}
      <StyledStep expanded $bold $state={isExecuted ? 'confirmed' : 'disabled'}>
        <StepLabel icon={isExecuted ? <CheckIcon /> : <CircleIcon />}>
          {isExecuted ? 'Executed' : isPending ? 'Executing' : 'Execution'}
        </StepLabel>
        {detailedExecutionInfo.executor ? (
          <StepContent>
            <AddressInfo
              address={detailedExecutionInfo.executor.value}
              name={detailedExecutionInfo.executor.name}
              avatarUrl={detailedExecutionInfo.executor.logoUri}
              shortenHash={4}
            />
          </StepContent>
        ) : (
          !isConfirmed &&
          !isPending && (
            <StepContent sx={{ color: black300 }}>Can be executed once the threshold is reached</StepContent>
          )
        )}
      </StyledStep>
    </Stepper>
  )
}

export default TxSigners
