import useSafeInfo from '@/hooks/useSafeInfo'
import { useContext, useEffect } from 'react'
import { Box, Divider, Typography } from '@mui/material'

import { createUpdateThresholdTx } from '@/services/tx/tx-sender'
import { SETTINGS_EVENTS, trackEvent } from '@/services/analytics'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import { ChangeThresholdFlowFieldNames } from '@/components/tx-flow/flows/ChangeThreshold'
import type { ChangeThresholdFlowProps } from '@/components/tx-flow/flows/ChangeThreshold'

import commonCss from '@/components/tx-flow/common/styles.module.css'

const ReviewChangeThreshold = ({ params }: { params: ChangeThresholdFlowProps }) => {
  const { safe } = useSafeInfo()
  const newThreshold = params[ChangeThresholdFlowFieldNames.threshold]

  const { setSafeTx, setSafeTxError } = useContext(SafeTxContext)

  useEffect(() => {
    createUpdateThresholdTx(newThreshold).then(setSafeTx).catch(setSafeTxError)
  }, [newThreshold, setSafeTx, setSafeTxError])

  const onChangeThreshold = () => {
    trackEvent({ ...SETTINGS_EVENTS.SETUP.OWNERS, label: safe.owners.length })
    trackEvent({ ...SETTINGS_EVENTS.SETUP.THRESHOLD, label: newThreshold })
  }

  return (
    <SignOrExecuteForm onSubmit={onChangeThreshold}>
      <div>
        <Typography variant="body2" color="text.secondary" mb={0.5}>
          Any transaction will require the confirmation of:
        </Typography>

        <Typography>
          <b>{newThreshold}</b> out of <b>{safe.owners.length} signer(s)</b>
        </Typography>
      </div>
      <Box my={1}>
        <Divider className={commonCss.nestedDivider} />
      </Box>
    </SignOrExecuteForm>
  )
}

export default ReviewChangeThreshold
