import { useEffect } from 'react'
import { Box, Button, Grid, Typography } from '@mui/material'
import useWallet from '@/hooks/wallets/useWallet'
import { useCurrentChain } from '@/hooks/useChains'
import { isPairingSupported } from '@/services/pairing/utils'

import type { NewSafeFormData } from '@/components/new-safe/create'
import type { StepRenderProps } from '@/components/new-safe/CardStepper/useCardStepper'
import useSyncSafeCreationStep from '@/components/new-safe/create/useSyncSafeCreationStep'
import layoutCss from '@/components/new-safe/create/styles.module.css'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import { type PendingSafeData, SAFE_PENDING_CREATION_STORAGE_KEY } from '@/components/new-safe/create/steps/StatusStep'
import useConnectWallet from '@/components/common/ConnectWallet/useConnectWallet'
import KeyholeIcon from '@/components/common/icons/KeyholeIcon'
import PairingDescription from '@/components/common/PairingDetails/PairingDescription'
import PairingQRCode from '@/components/common/PairingDetails/PairingQRCode'

const ConnectWalletStep = ({ onSubmit, setStep }: StepRenderProps<NewSafeFormData>) => {
  const [pendingSafe] = useLocalStorage<PendingSafeData | undefined>(SAFE_PENDING_CREATION_STORAGE_KEY)
  const wallet = useWallet()
  const chain = useCurrentChain()
  const isSupported = isPairingSupported(chain?.disabledWallets)
  const handleConnect = useConnectWallet()
  useSyncSafeCreationStep(setStep)

  useEffect(() => {
    if (!wallet || pendingSafe) return

    onSubmit({ owners: [{ address: wallet.address, name: wallet.ens || '' }] })
  }, [onSubmit, wallet, pendingSafe])

  return (
    <>
      <Box className={layoutCss.row}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} display="flex" flexDirection="column" alignItems="center" gap={2}>
            <Box width={100} height={100} display="flex" alignItems="center" justifyContent="center">
              <KeyholeIcon />
            </Box>

            <Button onClick={handleConnect} variant="contained" size="stretched" disableElevation>
              Connect
            </Button>
          </Grid>

          {isSupported && (
            <Grid item xs={12} md={6} display="flex" flexDirection="column" alignItems="center" gap={2}>
              <PairingQRCode />
              <Typography variant="h6" fontWeight="700">
                Connect to {'Safe{Wallet}'} mobile
              </Typography>
              <PairingDescription />
            </Grid>
          )}
        </Grid>
      </Box>
    </>
  )
}

export default ConnectWalletStep
