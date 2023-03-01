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
import WalletIcon from '@/components/common/WalletIcon'
import { type ConnectedWallet } from '@/hooks/wallets/useOnboard'
import css from './styles.module.css'

enum ExecutionType {
  RELAYER = 'Via relayer',
  CONNECTED_WALLET = 'With connected wallet',
}

const RelayingChip = ({ children }: { children: ReactNode }) => <Box className={css.relayingChip}>{children}</Box>

const RelayerLabel = ({ text }: { text: string }) => {
  const svg = <SvgIcon component={RelayerIcon} inheritViewBox />

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {svg}
      <Typography sx={{ fontWeight: 'bold' }}>{text}</Typography>
      <RelayingChip>5 of 5</RelayingChip>
    </Stack>
  )
}

const ConnectedWalletLabel = ({ text, wallet }: { text: string; wallet: ConnectedWallet | null }) => (
  <Stack direction="row" spacing={1} alignItems="center">
    {wallet ? <WalletIcon provider={wallet.label} /> : null}
    <Typography sx={{ fontWeight: 'bold' }}>{text}</Typography>
  </Stack>
)

const ExecutionMethod = ({ wallet }: { wallet: ConnectedWallet | null }) => {
  return (
    <Paper elevation={0} variant="outlined" sx={{ borderWidth: '1px', marginBottom: '16px' }}>
      <FormControl fullWidth>
        <FormLabel sx={{ padding: '16px' }}>Chose the transaction execution method</FormLabel>
        <RadioGroup
          sx={{
            '& .MuiFormControlLabel-label': { width: '100%', padding: '16px' },
            '& .MuiFormControlLabel-label img': { width: '24px' },
            '& .MuiFormControlLabel-root': { margin: '0px' },
          }}
        >
          {/* {Object.values(ExecutionType).map((value) => (
            <FormControlLabel value={value} control={<Radio />} label={value} key={value} />
          ))} */}
          <Divider />
          <FormControlLabel value="RELAYER" control={<Radio />} label={<RelayerLabel text={ExecutionType.RELAYER} />} />
          <Divider />
          <FormControlLabel
            value="CONNECTED_WALLET"
            control={<Radio />}
            label={<ConnectedWalletLabel text={ExecutionType.CONNECTED_WALLET} wallet={wallet} />}
          />
        </RadioGroup>
      </FormControl>
    </Paper>
  )
}

export default ExecutionMethod
