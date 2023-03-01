import { type ReactNode } from 'react'
import {
  Box,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
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

enum ExecutionType {
  RELAYER = 'Via relayer',
  CONNECTED_WALLET = 'With connected wallet',
}

const RelayingChip = ({ children }: { children: ReactNode }) => <Box className={css.relayingChip}>{children}</Box>

const RelayerLabelContent = ({ value, remaining }: { value: string; remaining: number | undefined }) => {
  if (remaining === undefined) return null

  return (
    <>
      <SvgIcon component={RelayerIcon} inheritViewBox />
      <Typography fontWeight="bold">{value}</Typography>
      <RelayingChip>
        {/* Will the relays limit be variable? Can we fetch it from BE? */}
        <SvgIcon component={InfoIcon} fontSize="small" />
        {remaining} of 5
      </RelayingChip>
    </>
  )
}

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
  value: string
  walletLabel?: ConnectedWallet['label']
  remaining?: number
}) => {
  const labelComponent = (
    <Stack direction="row" spacing={1} alignItems="center">
      {value === ExecutionType.RELAYER ? (
        <RelayerLabelContent value={value} remaining={remaining} />
      ) : (
        <ConnectedWalletLabelContent value={value} walletLabel={walletLabel || ''} />
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

const ExecutionMethod = ({ walletLabel }: { walletLabel: ConnectedWallet['label'] }) => {
  const [remaining] = useRemainingRelays()

  return (
    <Paper elevation={0} variant="outlined" sx={{ position: 'relative', borderWidth: '1px', marginBottom: '16px' }}>
      <div className={css.newChip}>
        <RelayingChip>New</RelayingChip>
      </div>
      <FormControl fullWidth>
        <FormLabel className={css.formLabel}>Chose the transaction execution method</FormLabel>
        <RadioGroup
          sx={{
            '& .MuiFormControlLabel-label': { width: '100%', padding: '16px' },
            '& .MuiFormControlLabel-label img': { width: '24px' },
            '& .MuiFormControlLabel-root': { margin: '0px' },
          }}
        >
          {Object.values(ExecutionType).map((value) => (
            <CustomFormControlLabel value={value} key={value} walletLabel={walletLabel} remaining={remaining} />
          ))}
        </RadioGroup>
      </FormControl>
    </Paper>
  )
}

export default ExecutionMethod
