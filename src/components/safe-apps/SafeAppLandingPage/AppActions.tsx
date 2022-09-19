import { Box, Button, MenuItem, Select, Typography, Grid, FormControl, InputLabel } from '@mui/material'
import { ChainInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import { useState } from 'react'
import { ConnectedWallet } from '@/hooks/wallets/useOnboard'
import { useAppSelector } from '@/store'
import { selectAddressBookByChain } from '@/store/addressBookSlice'
import useLastSafe from '@/hooks/useLastSafe'
import { parsePrefixedAddress } from '@/utils/addresses'
import SafeIcon from '@/components/common/SafeIcon'
import EthHashInfo from '@/components/common/EthHashInfo'
import { AppRoutes } from '@/config/routes'
import { CTA_BUTTON_WIDTH, CTA_HEIGHT } from '@/components/safe-apps/SafeAppLandingPage/constants'

type Props = {
  appUrl: string
  wallet: ConnectedWallet | null
  onConnectWallet: () => Promise<void>
  safes: string[]
  chain: ChainInfo
}

const AppActions = ({ wallet, onConnectWallet, safes, chain, appUrl }: Props): React.ReactElement => {
  const lastUsedSafe = useLastSafe()
  const lastUsedSafeAddress =
    lastUsedSafe && safes.includes(lastUsedSafe) ? parsePrefixedAddress(lastUsedSafe).address : ''
  const [safeToUse, setSafeToUse] = useState<string | undefined>(lastUsedSafeAddress || undefined)
  const addressBook = useAppSelector((state) => selectAddressBookByChain(state, chain.chainId))
  const hasWallet = !!wallet
  const hasSafes = safes.length > 0
  const shouldCreateSafe = hasWallet && !hasSafes

  let button: React.ReactNode
  switch (true) {
    case hasWallet && hasSafes:
      const href = `${AppRoutes.safe.apps}?appUrl=${encodeURIComponent(appUrl)}&safe=${chain.shortName}:${safeToUse}`

      button = (
        <Button variant="contained" sx={{ width: CTA_BUTTON_WIDTH }} disabled={!safeToUse} href={href}>
          Use app
        </Button>
      )
      break
    case shouldCreateSafe:
      const redirect = encodeURIComponent(`${AppRoutes.safe.apps}?appUrl=${appUrl}`)
      const createSafeHrefWithRedirect = `${AppRoutes.open}?safeViewRedirectURL=${redirect}`
      button = (
        <Button variant="contained" sx={{ width: CTA_BUTTON_WIDTH }} href={createSafeHrefWithRedirect}>
          Create new Safe
        </Button>
      )
      break
    default:
      button = (
        <Button onClick={onConnectWallet} variant="contained" sx={{ width: CTA_BUTTON_WIDTH }}>
          Connect wallet
        </Button>
      )
  }
  let body: React.ReactNode
  if (hasWallet && hasSafes) {
    body = (
      <FormControl>
        <InputLabel id="safe-select-label">Select a Safe</InputLabel>
        <Select
          labelId="safe-select-label"
          defaultValue={lastUsedSafeAddress}
          onChange={(e) => setSafeToUse(e.target.value)}
          label="Select a Safe"
          sx={({ spacing }) => ({
            width: '311px',
            minHeight: '56px',
            '.MuiSelect-select': { padding: `${spacing(1)} ${spacing(2)}` },
          })}
        >
          {safes.map((safe) => (
            <MenuItem key={safe} value={safe}>
              <Grid container alignItems="center" gap={1}>
                <SafeIcon address={safe} />

                <Grid item xs>
                  <Typography variant="body2">{addressBook[safe]}</Typography>

                  <EthHashInfo address={safe} showAvatar={false} showName={false} prefix={chain.shortName} />
                </Grid>
              </Grid>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    )
  } else {
    body = <img src="/images/safe-creation.svg" alt="An icon of a physical safe with a plus sign" />
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="space-between"
      fontWeight={700}
      height={CTA_HEIGHT}
    >
      <Typography variant="h5" fontWeight={700}>
        Use the App with your Safe
      </Typography>
      {body}
      {button}
    </Box>
  )
}

export { AppActions }
