import { Box, Button, MenuItem, Select, Typography, Grid } from '@mui/material'
import { ConnectedWallet } from '@/hooks/wallets/useOnboard'
import { useState } from 'react'
import { useAppSelector } from '@/store'
import { selectAddressBookByChain } from '@/store/addressBookSlice'
import { useLastSafe } from '@/hooks/useLastSafe'
import { parsePrefixedAddress } from '@/utils/addresses'
import SafeIcon from '@/components/common/SafeIcon'
import EthHashInfo from '@/components/common/EthHashInfo'
import { AppRoutes } from '@/config/routes'

type Props = {
  appUrl: string
  wallet: ConnectedWallet | null
  onConnectWallet: () => Promise<void>
  safes: string[]
  chainId: string
  chainPrefix?: string
}

const UseApp = ({ wallet, onConnectWallet, safes, chainId, chainPrefix, appUrl }: Props): React.ReactElement => {
  const lastUsedSafe = useLastSafe()
  const lastUsedSafeAddress = lastUsedSafe ? parsePrefixedAddress(lastUsedSafe).address : undefined
  const [safeToUse, setSafeToUse] = useState<string>(lastUsedSafeAddress || '')
  const addressBook = useAppSelector((state) => selectAddressBookByChain(state, chainId))
  const hasWallet = !!wallet
  const hasSafes = safes.length > 0
  const shouldCreateSafe = hasWallet && !hasSafes

  console.log(safeToUse)

  let button: React.ReactNode
  switch (true) {
    case hasWallet && hasSafes:
      const href = `${AppRoutes.safe.apps}?appUrl=${appUrl}&safe=${chainPrefix}:${safeToUse}`
      button = (
        <Button variant="contained" sx={{ mt: 4, width: 186 }} disabled={!safeToUse} href={href}>
          Use app
        </Button>
      )
      break
    case shouldCreateSafe:
      const createSafeHrefWithRedirect = `${AppRoutes.open}?safeViewRedirectURL=${AppRoutes.safe.apps}?appUrl=${appUrl}`
      button = (
        <Button variant="contained" sx={{ mt: 4, width: 186 }} href={createSafeHrefWithRedirect}>
          Create new Safe
        </Button>
      )
      break
    default:
      button = (
        <Button onClick={onConnectWallet} variant="contained" sx={{ mt: 4, width: 186 }}>
          Connect wallet
        </Button>
      )
  }
  let body: React.ReactNode
  if (hasWallet && hasSafes) {
    body = (
      <Select
        labelId="asset-label"
        defaultValue={lastUsedSafeAddress}
        onChange={(e) => setSafeToUse(e.target.value)}
        sx={({ spacing }) => ({ width: '311px', '.MuiSelect-select': { padding: `${spacing(1)} ${spacing(2)}` } })}
      >
        {safes.map((safe) => (
          <MenuItem key={safe} value={safe}>
            <Grid container alignItems="center" gap={1}>
              <SafeIcon address={safe} />

              <Grid item xs>
                <Typography variant="body2">{addressBook[safe]}</Typography>

                <EthHashInfo address={safe} showAvatar={false} showName={false} prefix={chainPrefix} />
              </Grid>
            </Grid>
          </MenuItem>
        ))}
      </Select>
    )
  } else {
    body = <img src="/images/safe-creation.svg" alt="An icon of a physical safe with a plus sign" />
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center" fontWeight={700}>
      <Typography variant="h5" sx={{ mb: 3 }} fontWeight={700}>
        Use the App with your Safe
      </Typography>
      {body}
      {button}
    </Box>
  )
}

export { UseApp }
