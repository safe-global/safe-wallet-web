import * as React from 'react'
import { useRouter } from 'next/router'
// import { useAccount, useNetwork, useSignMessage } from 'wagmi'
// import WalletConnectionFence from '@components/moleculas/WalletConnectionFence'
import { SiweMessage } from 'siwe'
import { Stack, Typography, Paper, Grid, Button, List } from '@mui/material'
import useChainId from '../../hooks/useChainId'
import { useWeb3 } from '../../hooks/wallets/web3'
import type { Web3Provider } from '@ethersproject/providers'
import useWallet from '../../hooks/wallets/useWallet'
import useOwnedSafes from '@/hooks/useOwnedSafes'
import SafeSelectItem from '@/components/sidebar/SafeSelectItem'
import { submitSetup } from '@/api'

interface ILinkPageProps {}

function createSiweMessage(address: string, statement: string, chainId?: number) {
  const siweMessage = new SiweMessage({
    domain: window.location.hostname,
    address,
    statement,
    uri: window.location.origin,
    version: '1',
    chainId,
  })
  return siweMessage.prepareMessage()
}

const LinkPage: React.FunctionComponent<ILinkPageProps> = (props) => {
  const router = useRouter()
  const { message, name, msg_id } = router.query as any
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [selectedSafe, setSelectedSafe] = React.useState<string>()

  const wallet = useWallet()

  const [siweMessage, setSiweMessage] = React.useState('')
  const [signedMessage, setSignedMessage] = React.useState('')
  const [step, setStep] = React.useState(1)

  const ownedSafes = useOwnedSafes()
  const chainId = useChainId()
  const ownedSafesOnChain = ownedSafes[chainId] ?? []

  const provider: Web3Provider | undefined = useWeb3()

  const onSign = async () => {
    if (provider) {
      const signedMessage = await provider.getSigner().signMessage(siweMessage)
      try {
        setLoading(true)
        setSignedMessage(signedMessage)
        setStep(2)
        setLoading(false)
      } catch (e: any) {
        setLoading(false)
        setError(e.message)
      }
    }
  }

  const handleFormSubmit = async () => {
    if (!selectedSafe) {
      setError('Choose safe')
      return
    }
    try {
      setLoading(true)
      const response = await submitSetup(msg_id, siweMessage, signedMessage, selectedSafe!)
      setLoading(false)
      if (response.ok) router.push('/link/success')
      else {
        const error = await response.json()
        throw new Error(error)
      }
    } catch (e: any) {
      setLoading(false)
      setError(e.message)
    }
  }

  React.useEffect(() => {
    if (wallet && chainId && provider) {
      const siweMsg = createSiweMessage(wallet?.address, message, chainId as any)
      console.log(siweMsg)
      setSiweMessage(siweMsg)
    }
  }, [chainId, wallet, provider])

  return step == 1 ? (
    <Stack alignItems={'center'} pt={5}>
      <Stack spacing={1}>
        <Typography variant="h3" component="h3">
          Signature Request
        </Typography>
        <Typography>Message</Typography>
        <Paper variant="outlined" sx={{ width: 350, padding: 2 }}>
          <Typography sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{siweMessage}</Typography>
        </Paper>
        <Grid container>
          <Grid xs={6} sx={{ pr: 1 }}>
            <Button variant="contained" color="error" fullWidth disabled={loading}>
              Reject
            </Button>
          </Grid>
          <Grid xs={6} sx={{ pl: 1 }}>
            <Button onClick={onSign} variant="contained" fullWidth disabled={loading}>
              Sign
            </Button>
          </Grid>
        </Grid>
        {error && (
          <Typography color="red" sx={{ width: 350 }}>
            {error}
          </Typography>
        )}
      </Stack>
    </Stack>
  ) : (
    <Stack alignItems={'center'} pt={5}>
      <List disablePadding>
        {ownedSafesOnChain.map((address) => (
          <SafeSelectItem
            selected={address == selectedSafe}
            key={address}
            address={address}
            chainId={chainId}
            onClick={setSelectedSafe}
          />
        ))}
        <Button onClick={handleFormSubmit} variant="contained" fullWidth disabled={loading || !selectedSafe}>
          Confirm
        </Button>
        {error && (
          <Typography color="red" sx={{ width: 350 }}>
            {error}
          </Typography>
        )}
      </List>
    </Stack>
  )
}

export default LinkPage
