import { Box, Button, Typography } from '@mui/material'
import { useState } from 'react'

import TxModal from '@/components/tx/TxModal'

import useTxSender from '@/hooks/useTxSender'
import useAsync from '@/hooks/useAsync'

import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import type { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { createSetFallbackHandlerTx } from '@/services/tx/safeUpdateParams'

import useSafeInfo from '@/hooks/useSafeInfo'
import { useCurrentChain } from '@/hooks/useChains'
import ExternalLink from '@/components/common/ExternalLink'

const SetFallbackHandlerSteps: TxStepperProps['steps'] = [
  {
    label: 'Set fallback handler',
    render: (_, onSubmit) => <ReviewSetFallbackHandlerStep onSubmit={onSubmit} />,
  },
]

const SetFallbackHandlerDialog = () => {
  const [open, setOpen] = useState(false)

  const handleClose = () => setOpen(false)

  return (
    <Box paddingTop={2}>
      <div>
        <Button onClick={() => setOpen(true)} variant="contained">
          Set fallback handler
        </Button>
      </div>
      {open && <TxModal onClose={handleClose} steps={SetFallbackHandlerSteps} />}
    </Box>
  )
}

const ReviewSetFallbackHandlerStep = ({ onSubmit }: { onSubmit: (txId?: string) => void }) => {
  const { safe, safeLoaded } = useSafeInfo()
  const chain = useCurrentChain()
  const { createTx } = useTxSender()

  const [safeTx, safeTxError] = useAsync<SafeTransaction>(() => {
    if (!chain || !safeLoaded) return

    const tx = createSetFallbackHandlerTx(safe, chain)

    return createTx(tx)
  }, [chain, safe, safeLoaded, createTx])

  return (
    <SignOrExecuteForm safeTx={safeTx} onSubmit={onSubmit} error={safeTxError}>
      <Typography mb={2}>
        This transaction will set your fallback handler to the recommended one for your contract version.
      </Typography>

      <Typography mb={2}>
        Through fallback handlers additional functionality can be given to your Safe.{' '}
        <ExternalLink href="https://help.safe.global/en/articles/4738352-what-is-a-fallback-handler-and-how-does-it-relate-to-the-gnosis-safe">
          Learn more
        </ExternalLink>
      </Typography>

      <Typography mb={2}>
        You will need to confirm this update just like any other transaction. This means other owners will have to
        confirm the update in case more than one confirmation is required for this Safe.
      </Typography>
    </SignOrExecuteForm>
  )
}

export default SetFallbackHandlerDialog
