import { OVERVIEW_EVENTS, trackEvent } from '@/services/analytics'
import dynamic from 'next/dynamic'
import React, { useContext } from 'react'
import { Button, CircularProgress, Tooltip, Typography } from '@mui/material'
import { TxModalContext } from '@/components/tx-flow'
import { PendingSafeStatus, selectUndeployedSafe } from '@/features/counterfactual/store/undeployedSafesSlice'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useAppSelector } from '@/store'

const ActivateAccountFlow = dynamic(() => import('./ActivateAccountFlow'))

const ActivateAccountButton = () => {
  const { safe, safeAddress } = useSafeInfo()
  const undeployedSafe = useAppSelector((state) => selectUndeployedSafe(state, safe.chainId, safeAddress))
  const { setTxFlow } = useContext(TxModalContext)

  const isProcessing = undeployedSafe?.status.status !== PendingSafeStatus.AWAITING_EXECUTION

  const activateAccount = () => {
    trackEvent({ ...OVERVIEW_EVENTS.CHOOSE_TRANSACTION_TYPE, label: 'activate_now' })
    setTxFlow(<ActivateAccountFlow />)
  }

  return (
    <Tooltip title={isProcessing ? 'The safe activation is already in process' : undefined}>
      <span>
        <Button variant="contained" size="small" onClick={activateAccount} disabled={isProcessing}>
          {isProcessing ? (
            <>
              <Typography variant="body2" component="span" mr={1}>
                Processing
              </Typography>
              <CircularProgress size={16} />
            </>
          ) : (
            'Activate now'
          )}
        </Button>
      </span>
    </Tooltip>
  )
}

export default ActivateAccountButton
