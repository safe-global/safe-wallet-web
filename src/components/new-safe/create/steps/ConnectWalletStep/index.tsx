import { useEffect, useState } from 'react'
import { Box, Button } from '@mui/material'
import useWallet from '@/hooks/wallets/useWallet'

import type { NewSafeFormData } from '@/components/new-safe/create'
import type { StepRenderProps } from '@/components/new-safe/CardStepper/useCardStepper'
import useSyncSafeCreationStep from '@/components/new-safe/create/useSyncSafeCreationStep'
import layoutCss from '@/components/new-safe/create/styles.module.css'
import useConnectWallet from '@/components/common/ConnectWallet/useConnectWallet'
import KeyholeIcon from '@/components/common/icons/KeyholeIcon'
import { usePendingSafe } from '../StatusStep/usePendingSafe'

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
    <Box className={layoutCss.row} display="flex" alignItems="center" gap={3}>
      <KeyholeIcon />
      <Button onClick={handleConnect} variant="contained" size="stretched" disableElevation>
        Connect wallet
      </Button>
    </Box>
  )
}

export default ConnectWalletStep
