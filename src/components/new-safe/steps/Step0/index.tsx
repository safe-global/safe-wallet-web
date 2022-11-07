import { useEffect } from 'react'
import { Box, Grid } from '@mui/material'
import useWallet from '@/hooks/wallets/useWallet'
import { useCurrentChain } from '@/hooks/useChains'
import { isPairingSupported } from '@/services/pairing/utils'

import type { NewSafeFormData } from '@/components/new-safe/CreateSafe'
import type { StepRenderProps } from '@/components/new-safe/CardStepper/useCardStepper'
import WalletDetails from '@/components/common/ConnectWallet/WalletDetails'
import PairingDetails from '@/components/common/PairingDetails'
import useSetCreationStep from '@/components/new-safe/CreateSafe/useSetCreationStep'
import layoutCss from '@/components/new-safe/CreateSafe/styles.module.css'

const CreateSafeStep0 = ({ onSubmit, setStep }: StepRenderProps<NewSafeFormData>) => {
  const wallet = useWallet()
  const chain = useCurrentChain()
  const isSupported = isPairingSupported(chain?.disabledWallets)
  useSetCreationStep(setStep)

  useEffect(() => {
    if (!wallet) return

    onSubmit({ owners: [{ address: wallet.address, name: wallet.ens || '' }] })
  }, [onSubmit, wallet])

  return (
    <>
      <Box className={layoutCss.row}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} display="flex" flexDirection="column" alignItems="center" gap={2}>
            <WalletDetails />
          </Grid>

          {isSupported && (
            <Grid item xs={12} md={6} display="flex" flexDirection="column" alignItems="center" gap={2}>
              <PairingDetails vertical />
            </Grid>
          )}
        </Grid>
      </Box>
    </>
  )
}

export default CreateSafeStep0
