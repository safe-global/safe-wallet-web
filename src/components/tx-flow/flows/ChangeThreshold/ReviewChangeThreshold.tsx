import useSafeInfo from '@/hooks/useSafeInfo'
import { useContext, useEffect } from 'react'
import { Box, Divider, Typography } from '@mui/material'

import { createUpdateThresholdTx } from '@/services/tx/tx-sender'
import { SETTINGS_EVENTS, trackEvent } from '@/services/analytics'
import type { SubmitCallback } from '@/components/tx/SignOrExecuteForm'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import { ChangeThresholdFlowFieldNames } from '@/components/tx-flow/flows/ChangeThreshold'
import type { ChangeThresholdFlowProps } from '@/components/tx-flow/flows/ChangeThreshold'
import { TX_EVENTS, TX_TYPES } from '@/services/analytics/events/transactions'

import commonCss from '@/components/tx-flow/common/styles.module.css'

const ReviewChangeThreshold = ({ params }: { params: ChangeThresholdFlowProps }) => {
  const { safe } = useSafeInfo()
  const newThreshold = params[ChangeThresholdFlowFieldNames.threshold]

  const { setSafeTx, setSafeTxError } = useContext(SafeTxContext)

  useEffect(() => {
    createUpdateThresholdTx(newThreshold).then(setSafeTx).catch(setSafeTxError)
  }, [newThreshold, setSafeTx, setSafeTxError])

  const onChangeThreshold: SubmitCallback = (_, isExecuted) => {
    trackEvent({ ...SETTINGS_EVENTS.SETUP.OWNERS, label: safe.owners.length })
    trackEvent({ ...SETTINGS_EVENTS.SETUP.THRESHOLD, label: newThreshold })
    trackEvent({ ...TX_EVENTS.CREATE, label: TX_TYPES.owner_threshold_change })
    if (isExecuted) {
      trackEvent({ ...TX_EVENTS.EXECUTE, label: TX_TYPES.owner_threshold_change })
    } else {
      trackEvent({ ...TX_EVENTS.CONFIRM, label: TX_TYPES.owner_threshold_change })
    }
  }

  return (
    <SignOrExecuteForm onSubmit={onChangeThreshold}>
      <div>
        <Typography variant="body2" color="text.secondary" mb={0.5}>
          Any transaction will require the confirmation of:
        </Typography>

        <Typography>
          <b>{newThreshold}</b> out of <b>{safe.owners.length} owner(s)</b>
        </Typography>
      </div>
      <Box my={1}>
        <Divider className={commonCss.nestedDivider} />
      </Box>
    </SignOrExecuteForm>
  )
}

export default ReviewChangeThreshold
