import { useContext } from 'react'
import { Typography } from '@mui/material'

import ExternalLink from '@/components/common/ExternalLink'
import { LATEST_SAFE_VERSION } from '@/config/constants'
import { useCurrentChain } from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'
import { createUpdateSafeTxs } from '@/services/tx/safeUpdateParams'
import { createMultiSendCallOnlyTx } from '@/services/tx/tx-sender'
import { SafeTxContext } from '../../SafeTxProvider'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import useAsync from '@/hooks/useAsync'

export const UpdateSafeReview = () => {
  const { safe, safeLoaded } = useSafeInfo()
  const chain = useCurrentChain()
  const { setSafeTx, setSafeTxError } = useContext(SafeTxContext)

  useAsync(async () => {
    if (!chain || !safeLoaded) {
      return
    }

    const txs = await createUpdateSafeTxs(safe, chain)
    createMultiSendCallOnlyTx(txs).then(setSafeTx).catch(setSafeTxError)
  }, [safe, safeLoaded, chain, setSafeTx, setSafeTxError])

  return (
    <SignOrExecuteForm>
      <Typography mb={2}>
        Update now to take advantage of new features and the highest security standards available.
      </Typography>

      <Typography mb={2}>
        To check details about updates added by this smart contract version please visit{' '}
        <ExternalLink href={`https://github.com/safe-global/safe-contracts/releases/tag/v${LATEST_SAFE_VERSION}`}>
          latest Safe Account contracts changelog
        </ExternalLink>
      </Typography>

      <Typography mb={2}>
        You will need to confirm this update just like any other transaction. This means other signers will have to
        confirm the update in case more than one confirmation is required for this Safe Account.
      </Typography>

      <Typography mb={2}>
        <b>Warning:</b> this upgrade will invalidate all unexecuted transactions. This means you will be unable to
        access or execute them after the upgrade. Please make sure to execute any remaining transactions before
        upgrading.
      </Typography>
    </SignOrExecuteForm>
  )
}
