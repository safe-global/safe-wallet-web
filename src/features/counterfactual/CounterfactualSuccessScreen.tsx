import EthHashInfo from '@/components/common/EthHashInfo'
import { safeCreationPendingStatuses } from '@/features/counterfactual/hooks/usePendingSafeStatuses'
import { SafeCreationEvent, safeCreationSubscribe } from '@/features/counterfactual/services/safeCreationEvents'
import { useEffect, useState } from 'react'
import { Box, Button, Dialog, DialogContent, Typography } from '@mui/material'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'

const CounterfactualSuccessScreen = () => {
  const [open, setOpen] = useState<boolean>(false)
  const [safeAddress, setSafeAddress] = useState<string>()

  useEffect(() => {
    const unsubFns = Object.entries(safeCreationPendingStatuses).map(([event]) =>
      safeCreationSubscribe(event as SafeCreationEvent, async (detail) => {
        if (event === SafeCreationEvent.INDEXED) {
          setSafeAddress(detail.safeAddress)
          setOpen(true)
        }
      }),
    )

    return () => {
      unsubFns.forEach((unsub) => unsub())
    }
  }, [])

  return (
    <Dialog open={open}>
      <DialogContent
        sx={{
          py: 10,
          px: 6,
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
        }}
      >
        <Box
          sx={{
            backgroundColor: ({ palette }) => palette.success.background,
            padding: 3,
            borderRadius: '50%',
            display: 'inline-flex',
          }}
        >
          <CheckRoundedIcon sx={{ width: 50, height: 50 }} color="success" />
        </Box>

        <Box textAlign="center">
          <Typography variant="h3" fontWeight="bold" mb={1}>
            Account is activated!
          </Typography>
          <Typography>
            Your Safe Account was successfully deployed on chain. You can continue making improvements to your account
            setup and security.
          </Typography>
        </Box>

        {safeAddress && (
          <Box p={2} bgcolor="background.main" borderRadius={1} fontSize={14}>
            <EthHashInfo address={safeAddress} shortAddress={false} showCopyButton avatarSize={32} />
          </Box>
        )}

        <Button variant="contained" onClick={() => setOpen(false)}>
          Continue
        </Button>
      </DialogContent>
    </Dialog>
  )
}

export default CounterfactualSuccessScreen
