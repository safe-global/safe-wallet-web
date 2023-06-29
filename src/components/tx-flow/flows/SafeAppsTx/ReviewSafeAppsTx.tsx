import { useContext, useEffect, useMemo, useState } from 'react'
import type { ReactElement } from 'react'
import { ErrorBoundary } from '@sentry/react'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import SendToBlock from '@/components/tx-flow/flows/TokenTransfer/SendToBlock'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { useCurrentChain } from '@/hooks/useChains'
import type { SafeAppsTxParams } from '.'
import { trackSafeAppTxCount } from '@/services/safe-apps/track-app-usage-count'
import { getTxOrigin } from '@/utils/transactions'
import { createMultiSendCallOnlyTx, createTx, dispatchSafeAppsTx } from '@/services/tx/tx-sender'
import useOnboard from '@/hooks/wallets/useOnboard'
import useSafeInfo from '@/hooks/useSafeInfo'
import { Box, Divider } from '@mui/material'
import useHighlightHiddenTab from '@/hooks/useHighlightHiddenTab'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import ApprovalEditor from '@/components/tx/ApprovalEditor'
import { getInteractionTitle } from '@/components/safe-apps/utils'
import ErrorMessage from '@/components/tx/ErrorMessage'
import { asError } from '@/services/exceptions/utils'
import commonCss from '@/components/tx-flow/common/styles.module.css'

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
  const { safeTx, setSafeTx, safeTxError, setSafeTxError } = useContext(SafeTxContext)

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
      setSafeTxError(asError(error))
    }
  }

  const origin = useMemo(() => getTxOrigin(app), [app])

  return (
    <SignOrExecuteForm onSubmit={handleSubmit} origin={origin}>
      <ErrorBoundary fallback={<div>Error parsing data</div>}>
        <ApprovalEditor safeTransaction={safeTx} updateTransaction={setTxList} />
      </ErrorBoundary>

      <Box mb={1} mt={-1}>
        <Divider className={commonCss.nestedDivider} />
      </Box>

      {safeTx ? (
        <SendToBlock address={safeTx.data.to} title={getInteractionTitle(safeTx.data.value || '', chain)} />
      ) : safeTxError ? (
        <ErrorMessage error={safeTxError}>
          This Safe App initiated a transaction which cannot be processed. Please get in touch with the developer of
          this Safe App for more information.
        </ErrorMessage>
      ) : null}
    </SignOrExecuteForm>
  )
}

export default ReviewSafeAppsTx
