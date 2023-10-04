import { useEffect, useState } from 'react'
import { Box, Button, Divider, Typography } from '@mui/material'
import useWallet from '@/hooks/wallets/useWallet'

import type { NewSafeFormData } from '@/components/new-safe/create'
import type { StepRenderProps } from '@/components/new-safe/CardStepper/useCardStepper'
import useSyncSafeCreationStep from '@/components/new-safe/create/useSyncSafeCreationStep'
import layoutCss from '@/components/new-safe/create/styles.module.css'
import useConnectWallet from '@/components/common/ConnectWallet/useConnectWallet'
import KeyholeIcon from '@/components/common/icons/KeyholeIcon'
import { usePendingSafe } from '../StatusStep/usePendingSafe'
import { MPCWallet } from '@/components/common/ConnectWallet/MPCWallet'

const ConnectWalletStep = ({ onSubmit, setStep }: StepRenderProps<NewSafeFormData>) => {
  const [pendingSafe] = usePendingSafe()
  const wallet = useWallet()
  const handleConnect = useConnectWallet()
  const [, setSubmitted] = useState(false)
  useSyncSafeCreationStep(setStep)

  useEffect(() => {
    if (!wallet || pendingSafe) return

    setSubmitted((prev) => {
      if (prev) return prev
      onSubmit({ owners: [{ address: wallet.address, name: wallet.ens || '' }] })
      return true
    })
  }, [onSubmit, wallet, pendingSafe])

  return (
    <>
      <Box className={layoutCss.row}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Box width={100} height={100} display="flex" alignItems="center" justifyContent="center">
            <KeyholeIcon />
          </Box>

          <Button onClick={handleConnect} variant="contained" size="stretched" disableElevation>
            Connect
          </Button>

          <Divider sx={{ width: '100%' }}>
            <Typography color="primary">or</Typography>
          </Divider>

          <MPCWallet />
        </Box>
      </Box>
    </>
  )
}

export default ConnectWalletStep
