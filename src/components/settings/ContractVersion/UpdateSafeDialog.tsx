import { Box, Button, Link, Typography } from '@mui/material'
import { useState } from 'react'

import { LATEST_SAFE_VERSION } from '@/config/constants'

import TxModal from '@/components/tx/TxModal'

import { createMultiSendTx } from '@/services/tx/txSender'
import useAsync from '@/hooks/useAsync'

import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import { createUpdateSafeTxs } from '@/services/tx/safeUpdateParams'

import useSafeInfo from '@/hooks/useSafeInfo'
import { useCurrentChain } from '@/hooks/useChains'

const UpdateSafeSteps: TxStepperProps['steps'] = [
  {
    label: 'Update Safe version',
    render: (_, onSubmit) => <ReviewUpdateSafeStep onSubmit={onSubmit} />,
  },
]

const UpdateSafeDialog = () => {
  const [open, setOpen] = useState(false)

  const handleClose = () => setOpen(false)

  return (
    <Box paddingTop={2}>
      <div>
        <Button onClick={() => setOpen(true)} variant="contained">
          Update Safe
        </Button>
      </div>
      {open && <TxModal onClose={handleClose} steps={UpdateSafeSteps} />}
    </Box>
  )
}

const ReviewUpdateSafeStep = ({ onSubmit }: { onSubmit: (data: null) => void }) => {
  const { safe, safeLoaded } = useSafeInfo()
  const chain = useCurrentChain()

  const [safeTx, safeTxError] = useAsync<SafeTransaction>(() => {
    if (!chain || !safeLoaded) return

    const txs = createUpdateSafeTxs(safe, chain)
    return createMultiSendTx(txs)
  }, [chain, safe, safeLoaded])

  return (
    <SignOrExecuteForm safeTx={safeTx} isExecutable={safe.threshold === 1} onSubmit={onSubmit} error={safeTxError}>
      <Typography mb={2}>
        Update now to take advantage of new features and the highest security standards available.
      </Typography>

      <Typography mb={2}>
        To check details about updates added by this smart contract version please visit{' '}
        <Link
          rel="noreferrer noopener"
          href={`https://github.com/gnosis/safe-contracts/releases/tag/v${LATEST_SAFE_VERSION}`}
          target="_blank"
        >
          latest Safe contracts changelog
        </Link>
      </Typography>

      <Typography mb={2}>
        You will need to confirm this update just like any other transaction. This means other owners will have to
        confirm the update in case more than one confirmation is required for this Safe.
      </Typography>

      <Typography mb={2}>
        <b>Warning:</b> this upgrade will invalidate all unexecuted transactions. This means you will be unable to
        access or execute them after the upgrade. Please make sure to execute any remaining transactions before
        upgrading.
      </Typography>
    </SignOrExecuteForm>
  )
}

export default UpdateSafeDialog
