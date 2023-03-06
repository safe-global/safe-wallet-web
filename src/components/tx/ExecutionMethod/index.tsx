import { type ReactNode, useEffect } from 'react'
import {
  Box,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
  Skeleton,
  Stack,
  SvgIcon,
  Typography,
} from '@mui/material'
import RelayerIcon from '@/public/images/common/relayer.svg'
import InfoIcon from '@/public/images/notifications/info.svg'
import WalletIcon from '@/components/common/WalletIcon'
import { type ConnectedWallet } from '@/hooks/wallets/useOnboard'
import css from './styles.module.css'
import useRemainingRelays from '@/hooks/useRemainingRelays'
import classnames from 'classnames'

export enum ExecutionType {
  RELAYER = 'Via relayer',
  CONNECTED_WALLET = 'With connected wallet',
}

const MAX_RELAYS = 5

const isRelayExecution = (executionMethod: ExecutionType) => executionMethod === ExecutionType.RELAYER

const RelayingChip = ({
  hasReachedRelayLimit = false,
  children,
}: {
  hasReachedRelayLimit?: boolean
  children: ReactNode
}) => <Box className={classnames(css.relayingChip, { [css.unavailable]: hasReachedRelayLimit })}>{children}</Box>

const RelayerLabelContent = ({ value, remainingRelays }: { value: string; remainingRelays: number | undefined }) => (
  <>
    <SvgIcon component={RelayerIcon} inheritViewBox />
    <Typography fontWeight="bold">{value}</Typography>
    {remainingRelays !== undefined ? (
      <RelayingChip hasReachedRelayLimit={remainingRelays === 0}>
        <SvgIcon component={InfoIcon} fontSize="small" />
        {remainingRelays} of {MAX_RELAYS}
      </RelayingChip>
    ) : (
      <Skeleton className={css.chipSkeleton} variant="rounded" />
    )}
  </>
)

const ConnectedWalletLabelContent = ({
  value,
  walletLabel,
}: {
  value: string
  walletLabel: ConnectedWallet['label']
}) => (
  <>
    <WalletIcon provider={walletLabel} />
    <Typography fontWeight="bold">{value}</Typography>
  </>
)

const CustomFormControlLabel = ({
  value,
  walletLabel,
  remainingRelays,
}: {
  value: ExecutionType
  walletLabel: ConnectedWallet['label']
  remainingRelays?: number
}) => {
  const relayLimitReached = remainingRelays === 0 && isRelayExecution(value)

  const labelComponent = (
    <Stack direction="row" spacing={1} alignItems="center">
      {isRelayExecution(value) ? (
        <RelayerLabelContent value={value} remainingRelays={remainingRelays} />
      ) : (
        <ConnectedWalletLabelContent value={value} walletLabel={walletLabel} />
      )}
    </Stack>
  )

  return (
    <>
      <Divider />
      <FormControlLabel value={value} control={<Radio />} label={labelComponent} disabled={relayLimitReached} />
    </>
  )
}

const ExecutionMethod = ({
  walletLabel,
  executionMethod,
  onChange,
}: {
  walletLabel: ConnectedWallet['label']
  executionMethod: ExecutionType
  onChange: (value: ExecutionType) => void
}) => {
  const [remainingRelays] = useRemainingRelays()

  useEffect(() => {
    if (remainingRelays === 0) {
      onChange(ExecutionType.CONNECTED_WALLET)
    }
  }, [onChange, remainingRelays])

  return (
    <Paper elevation={0} variant="outlined" className={css.wrapper}>
      <div className={css.newChip}>
        <RelayingChip>New</RelayingChip>
      </div>
      <FormControl fullWidth>
        <FormLabel className={css.formLabel}>Chose the transaction execution method</FormLabel>
        <RadioGroup value={executionMethod} onChange={(e) => onChange(e.target.value as ExecutionType)}>
          {Object.values(ExecutionType).map((value) => (
            <CustomFormControlLabel
              value={value}
              key={value}
              walletLabel={walletLabel}
              remainingRelays={remainingRelays}
            />
          ))}
        </RadioGroup>
      </FormControl>
    </Paper>
  )
}

export default ExecutionMethod
