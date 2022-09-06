import { Box, Button, MenuItem, Select, Typography, ListItemIcon, ListItemText } from '@mui/material'
import { ConnectedWallet } from '@/hooks/wallets/useOnboard'
import { useState } from 'react'
import { useAppSelector } from '@/store'
import { selectAddressBookByChain } from '@/store/addressBookSlice'
import { useLastSafe } from '@/hooks/useLastSafe'
import { parsePrefixedAddress } from '@/utils/addresses'
import SafeIcon from '@/components/common/SafeIcon'
import { shortenAddress } from '@/utils/formatters'

type Props = {
  wallet: ConnectedWallet | null
  onConnectWallet: () => Promise<void>
  safes: string[]
  createSafeHref: string
  chainId: string
}

const UseApp = ({ wallet, onConnectWallet, safes, createSafeHref, chainId }: Props): React.ReactElement => {
  const [safeToUse, setSafeToUse] = useState<string>()
  const lastUsedSafe = useLastSafe()
  const lastUsedSafeAddress = lastUsedSafe ? parsePrefixedAddress(lastUsedSafe).address : undefined
  const addressBook = useAppSelector((state) => selectAddressBookByChain(state, chainId))
  const hasWallet = !!wallet
  const hasSafes = safes.length > 0
  const shouldCreateSafe = hasWallet && !hasSafes

  console.log(addressBook)

  let button: React.ReactNode
  switch (true) {
    case hasWallet && hasSafes:
      button = (
        <Button variant="contained" sx={{ mt: 4, width: 186 }}>
          Use app
        </Button>
      )
      break
    case shouldCreateSafe:
      button = (
        <Button variant="contained" sx={{ mt: 4, width: 186 }} href={createSafeHref}>
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
        label="Select a safe"
        defaultValue={lastUsedSafeAddress}
        onChange={(e) => setSafeToUse(e.target.value)}
      >
        {safes.map((safe) => (
          <MenuItem key={safe} value={safe}>
            <ListItemIcon>
              <SafeIcon address={safe} />
            </ListItemIcon>
            <ListItemText primary={addressBook[safe]} secondary={shortenAddress(safe, 4)}></ListItemText>
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
