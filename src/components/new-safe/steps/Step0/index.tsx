import { Box, Button, Divider, Grid, Paper, Typography } from '@mui/material'
import useWallet from '@/hooks/wallets/useWallet'
import ChainSwitcher from '@/components/common/ChainSwitcher'
import NetworkSelector from '@/components/common/NetworkSelector'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import { useCurrentChain } from '@/hooks/useChains'
import { isPairingSupported } from '@/services/pairing/utils'

import type { NewSafeFormData } from '@/components/new-safe/CreateSafe'
import type { StepRenderProps } from '@/components/new-safe/CardStepper/useCardStepper'
import WalletDetails from '@/components/common/ConnectWallet/WalletDetails'
import PairingDetails from '@/components/common/PairingDetails'
import useCreateSafe from '@/components/new-safe/CreateSafe/useCreateSafe'
import type { ConnectedWallet } from '@/services/onboard'

export const ConnectWalletContent = ({ onSubmit }: { onSubmit: StepRenderProps<NewSafeFormData>['onSubmit'] }) => {
  const isWrongChain = useIsWrongChain()
  const wallet = useWallet()
  const chain = useCurrentChain()
  const isSupported = isPairingSupported(chain?.disabledWallets)

  const onConnect = (wallet?: ConnectedWallet) => {
    if (!wallet) return

    onSubmit({ owners: [{ address: wallet.address, name: wallet.ens || '' }] })
  }

  return (
    <>
      {wallet && !isWrongChain && <Typography mb={2}>Wallet connected</Typography>}
      {wallet ? (
        <Typography mb={2} component="div">
          Creating a Safe on <NetworkSelector />
        </Typography>
      ) : (
        <>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} display="flex" flexDirection="column" alignItems="center" gap={2}>
              <WalletDetails onConnect={onConnect} />
            </Grid>

            {isSupported && (
              <Grid item xs={12} md={6} display="flex" flexDirection="column" alignItems="center" gap={2}>
                <PairingDetails vertical />
              </Grid>
            )}
          </Grid>
        </>
      )}
      {isWrongChain && (
        <Typography mb={2}>
          Your wallet connection must match the selected network. <ChainSwitcher />
        </Typography>
      )}
    </>
  )
}

const CreateSafeStep0 = ({ onSubmit, onBack, setStep }: StepRenderProps<NewSafeFormData>) => {
  const { isConnected } = useCreateSafe(setStep)

  return (
    <Paper>
      <Box>
        <ConnectWalletContent onSubmit={onSubmit} />
      </Box>
      <Divider sx={{ ml: '-52px', mr: '-52px', mb: 4, mt: 3, alignSelf: 'normal' }} />
      <Box display="flex" flexDirection="row" gap={3}>
        <Button variant="outlined" onClick={() => onBack()}>
          Cancel
        </Button>
        <Button variant="contained" onClick={() => onSubmit({})} disabled={!isConnected}>
          Continue
        </Button>
      </Box>
    </Paper>
  )
}

export default CreateSafeStep0
