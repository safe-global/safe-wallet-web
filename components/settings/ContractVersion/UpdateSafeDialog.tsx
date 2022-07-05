import { Box, Button, Typography } from '@mui/material'
import { useMemo, useState } from 'react'

import TxModal from '@/components/tx/TxModal'

import { createTx } from '@/services/tx/txSender'
import useAsync from '@/hooks/useAsync'

import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { TxStepperProps } from '@/components/tx/TxStepper/useTxStepper'
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import { createSafeUpgradeParams } from '@/services/tx/safeUpgradeParams'
import { useMasterCopies } from '@/hooks/useMasterCopies'
import { eq } from 'semver'

import { LATEST_SAFE_VERSION } from '@/config/constants'
import useSafeInfo from '@/hooks/useSafeInfo'

// TODO: Remove hardcoded fallback handler address
const LATEST_FALLBACK_HANDLER_ADDRESS = '0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4'

const UpdateSafeSteps: TxStepperProps['steps'] = [
  {
    label: 'Update Safe version',
    render: (_, onSubmit) => <ReviewUpdateSafeStep onSubmit={onSubmit} />,
  },
]

export const UpdateSafeDialog = () => {
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
  const { safe } = useSafeInfo()
  const [masterCopies] = useMasterCopies()

  // @TODO: move to txSender, add events
  const updateSafeTx = useMemo(() => {
    const latestMasterCopy = masterCopies?.find((mc) => eq(LATEST_SAFE_VERSION, mc.version))
    if (safe && latestMasterCopy) {
      return createSafeUpgradeParams(safe.address.value, latestMasterCopy.address, LATEST_FALLBACK_HANDLER_ADDRESS)
    } else {
      return undefined
    }
  }, [masterCopies, safe])

  const [safeTx, safeTxError] = useAsync<SafeTransaction | undefined>(async () => {
    if (!updateSafeTx) return
    return await createTx(updateSafeTx)
  }, [updateSafeTx])

  const txError = safeTxError

  return (
    <SignOrExecuteForm
      safeTx={safeTx}
      isExecutable={safe?.threshold === 1}
      onSubmit={onSubmit}
      error={txError}
      title="Update safe version"
    >
      <Typography>
        Update now to take advantage of new features and the highest security standards available.
      </Typography>

      <Typography>
        To check details about updates added by this smart contract version please visit latest Gnosis Safe contracts
        changelog
      </Typography>

      <Typography>
        You will need to confirm this update just like any other transaction. This means other owners will have to
        confirm the update in case more than one confirmation is required for this Safe.
      </Typography>

      <Typography>
        <b>Warning:</b> this upgrade will invalidate all unexecuted transactions. This means you will be unable to
        access or execute them after the upgrade. Please make sure to execute any remaining transactions before
        upgrading.
      </Typography>
    </SignOrExecuteForm>
  )
}
