import type { ReactNode } from 'react'
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

export enum ExecutionType {
  RELAYER = 'Via relayer',
  CONNECTED_WALLET = 'With connected wallet',
}

const MAX_RELAYS = 5

const RelayingChip = ({ children }: { children: ReactNode }) => <Box className={css.relayingChip}>{children}</Box>

const RelayerLabelContent = ({ value, remaining }: { value: string; remaining: number | undefined }) => (
  <>
    <SvgIcon component={RelayerIcon} inheritViewBox />
    <Typography fontWeight="bold">{value}</Typography>
    {remaining !== undefined ? (
      <RelayingChip>
        <SvgIcon component={InfoIcon} fontSize="small" />
        {remaining} of {MAX_RELAYS}
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
  remaining,
}: {
  value: ExecutionType
  walletLabel: ConnectedWallet['label']
  remaining?: number
}) => {
  const labelComponent = (
    <Stack direction="row" spacing={1} alignItems="center">
      {value === ExecutionType.RELAYER ? (
        <RelayerLabelContent value={value} remaining={remaining} />
      ) : (
        <ConnectedWalletLabelContent value={value} walletLabel={walletLabel} />
      )}
    </Stack>
  )

  return (
    <>
      <Divider />
      <FormControlLabel value={value} control={<Radio />} label={labelComponent} />
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

  return (
    <Paper elevation={0} variant="outlined" className={css.wrapper}>
      <div className={css.newChip}>
        <RelayingChip>New</RelayingChip>
      </div>
      <FormControl fullWidth>
        <FormLabel className={css.formLabel}>Chose the transaction execution method</FormLabel>
        <RadioGroup value={executionMethod} onChange={(e) => onChange(e.target.value as ExecutionType)}>
          {Object.values(ExecutionType).map((value) => (
            <CustomFormControlLabel value={value} key={value} walletLabel={walletLabel} remaining={remainingRelays} />
          ))}
        </RadioGroup>
      </FormControl>
    </Paper>
  )
}

export default ExecutionMethod
