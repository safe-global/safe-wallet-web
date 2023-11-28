import { trackEvent } from '@/services/analytics'
import { TX_EVENTS, TX_TYPES } from '@/services/analytics/events/transactions'
import { Typography } from '@mui/material'
import { useContext, useEffect } from 'react'
import type { ReactElement } from 'react'

import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { createRemoveModuleTx } from '@/services/tx/tx-sender'
import { OwnerList } from '../../common/OwnerList'
import { SafeTxContext } from '../../SafeTxProvider'
import type { RecoveryFlowProps } from '.'

const onSubmit = () => {
  trackEvent({ ...TX_EVENTS.CREATE, label: TX_TYPES.recovery_remove })
}

export function RemoveRecoveryFlowReview({ delayModifier }: RecoveryFlowProps): ReactElement {
  const { setSafeTx, setSafeTxError } = useContext(SafeTxContext)

  useEffect(() => {
    createRemoveModuleTx(delayModifier.address).then(setSafeTx).catch(setSafeTxError)
  }, [delayModifier.address, setSafeTx, setSafeTxError])

  return (
    <SignOrExecuteForm onSubmit={onSubmit}>
      <Typography>
        This transaction will remove the recovery module from your Safe Account. You will no longer be able to recover
        your Safe Account once this transaction is executed.
      </Typography>

      <OwnerList
        title="Removing guardian"
        owners={delayModifier.guardians.map((guardian) => ({ value: guardian }))}
        sx={{ bgcolor: ({ palette }) => `${palette.warning.background} !important` }}
      />
    </SignOrExecuteForm>
  )
}
