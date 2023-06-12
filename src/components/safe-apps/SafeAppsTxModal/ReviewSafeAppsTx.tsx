import { useContext, useEffect, useMemo, useState } from 'react'
import type { ReactElement } from 'react'
import { ErrorBoundary } from '@sentry/react'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import SendFromBlock from '@/components/tx/SendFromBlock'
import SendToBlock from '@/components/tx/SendToBlock'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { useCurrentChain } from '@/hooks/useChains'
import { getInteractionTitle } from '../utils'
import type { SafeAppsTxParams } from '.'
import { trackSafeAppTxCount } from '@/services/safe-apps/track-app-usage-count'
import { getTxOrigin } from '@/utils/transactions'
import { ApprovalEditor } from '../../tx/ApprovalEditor'
import { createMultiSendCallOnlyTx, createTx, dispatchSafeAppsTx } from '@/services/tx/tx-sender'
import useOnboard from '@/hooks/wallets/useOnboard'
import useSafeInfo from '@/hooks/useSafeInfo'
import { Box, DialogContent, Typography } from '@mui/material'
import { generateDataRowValue } from '@/components/transactions/TxDetails/Summary/TxDataRow'
import useHighlightHiddenTab from '@/hooks/useHighlightHiddenTab'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'

type ReviewSafeAppsTxProps = {
  safeAppsTx: SafeAppsTxParams
}

const ReviewSafeAppsTx = ({
  safeAppsTx: { txs, requestId, params, appId, app },
}: ReviewSafeAppsTxProps): ReactElement => {
  const { safe } = useSafeInfo()
  const onboard = useOnboard()
  const chain = useCurrentChain()
  const [txList, setTxList] = useState(txs)
  const { safeTx, setSafeTx, setSafeTxError } = useContext(SafeTxContext)

  useHighlightHiddenTab()

  useEffect(() => {
    const createSafeTx = async (): Promise<SafeTransaction> => {
      const isMultiSend = txList.length > 1
      const tx = isMultiSend ? await createMultiSendCallOnlyTx(txList) : await createTx(txList[0])

      if (params?.safeTxGas) {
        // FIXME: do it properly via the Core SDK
        // @ts-expect-error safeTxGas readonly
        tx.data.safeTxGas = params.safeTxGas
      }

      return tx
    }

    createSafeTx().then(setSafeTx).catch(setSafeTxError)
  }, [txList, setSafeTx, setSafeTxError, params])

  const handleSubmit = async () => {
    if (!safeTx || !onboard) return
    trackSafeAppTxCount(Number(appId))

    try {
      await dispatchSafeAppsTx(safeTx, requestId, onboard, safe.chainId)
    } catch (error) {
      setSafeTxError(error as Error)
    }
  }

  const origin = useMemo(() => getTxOrigin(app), [app])

  return (
    <DialogContent>
      <SignOrExecuteForm onSubmit={handleSubmit} origin={origin}>
        <ErrorBoundary fallback={<div>Error parsing data</div>}>
          <ApprovalEditor txs={txList} updateTxs={setTxList} />
        </ErrorBoundary>

        <SendFromBlock />

        {safeTx && (
          <>
            <SendToBlock address={safeTx.data.to} title={getInteractionTitle(safeTx.data.value || '', chain)} />

            <Box pb={2}>
              <Typography mt={2} color="primary.light">
                Data (hex encoded)
              </Typography>
              {generateDataRowValue(safeTx.data.data, 'rawData')}
            </Box>
          </>
        )}
      </SignOrExecuteForm>
    </DialogContent>
  )
}

export default ReviewSafeAppsTx
