import type { ReactElement } from 'react'
import { useState } from 'react'
import { useMemo } from 'react'
import { hashMessage, _TypedDataEncoder } from 'ethers/lib/utils'
import { Box } from '@mui/system'
import { Typography, SvgIcon } from '@mui/material'
import WarningIcon from '@/public/images/notifications/warning.svg'
import { isObjectEIP712TypedData, Methods } from '@safe-global/safe-apps-sdk'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { OperationType } from '@safe-global/safe-core-sdk-types'

import SendFromBlock from '@/components/tx/SendFromBlock'
import { InfoDetails } from '@/components/transactions/InfoDetails'
import EthHashInfo from '@/components/common/EthHashInfo'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { generateDataRowValue } from '@/components/transactions/TxDetails/Summary/TxDataRow'
import type { SafeAppsSignMessageParams } from '@/components/safe-apps/SafeAppsSignMessageModal'
import useChainId from '@/hooks/useChainId'
import useAsync from '@/hooks/useAsync'
import { getReadOnlySignMessageLibContract } from '@/services/contracts/safeContracts'
import { DecodedMsg } from '@/components/safe-messages/DecodedMsg'
import CopyButton from '@/components/common/CopyButton'
import { getDecodedMessage } from '@/components/safe-apps/utils'
import { createTx, dispatchSafeAppsTx } from '@/services/tx/tx-sender'
import useOnboard from '@/hooks/wallets/useOnboard'
import useSafeInfo from '@/hooks/useSafeInfo'
import useHighlightHiddenTab from '@/hooks/useHighlightHiddenTab'

type ReviewSafeAppsSignMessageProps = {
  safeAppsSignMessage: SafeAppsSignMessageParams
}

const ReviewSafeAppsSignMessage = ({
  safeAppsSignMessage: { message, method, requestId },
}: ReviewSafeAppsSignMessageProps): ReactElement => {
  const chainId = useChainId()
  const { safe } = useSafeInfo()
  const onboard = useOnboard()
  const [submitError, setSubmitError] = useState<Error>()

  useHighlightHiddenTab()

  const isTextMessage = method === Methods.signMessage && typeof message === 'string'
  const isTypedMessage = method === Methods.signTypedMessage && isObjectEIP712TypedData(message)

  const readOnlySignMessageLibContract = useMemo(() => getReadOnlySignMessageLibContract(chainId), [chainId])
  const signMessageAddress = readOnlySignMessageLibContract.getAddress()

  const [decodedMessage, readableMessage] = useMemo(() => {
    if (isTextMessage) {
      const decoded = getDecodedMessage(message)
      return [decoded, decoded]
    } else if (isTypedMessage) {
      return [message, JSON.stringify(message, null, 2)]
    }
    return []
  }, [isTextMessage, isTypedMessage, message])

  const [safeTx, safeTxError] = useAsync<SafeTransaction>(() => {
    let txData

    if (isTextMessage) {
      txData = readOnlySignMessageLibContract.encode('signMessage', [hashMessage(getDecodedMessage(message))])
    } else if (isTypedMessage) {
      const typesCopy = { ...message.types }

      // We need to remove the EIP712Domain type from the types object
      // Because it's a part of the JSON-RPC payload, but for the `.hash` in ethers.js
      // The types are not allowed to be recursive, so ever type must either be used by another type, or be
      // the primary type. And there must only be one type that is not used by any other type.
      delete typesCopy.EIP712Domain
      txData = readOnlySignMessageLibContract.encode('signMessage', [
        _TypedDataEncoder.hash(message.domain, typesCopy, message.message),
      ])
    }

    return createTx({
      to: signMessageAddress,
      value: '0',
      data: txData || '0x',
      operation: OperationType.DelegateCall,
    })
  }, [message])

  const handleSubmit = async () => {
    setSubmitError(undefined)
    if (!safeTx || !onboard) return
    try {
      await dispatchSafeAppsTx(safeTx, requestId, onboard, safe.chainId)
    } catch (error) {
      setSubmitError(error as Error)
    }
  }

  return (
    <SignOrExecuteForm safeTx={safeTx} onSubmit={handleSubmit} error={safeTxError || submitError}>
      <>
        <SendFromBlock />

        <InfoDetails title="Interact with SignMessageLib">
          <EthHashInfo address={signMessageAddress} shortAddress={false} showCopyButton hasExplorer />
        </InfoDetails>

        {safeTx && (
          <Box pb={1}>
            <Typography mt={2} color="primary.light">
              Data (hex encoded)
            </Typography>
            {generateDataRowValue(safeTx.data.data, 'rawData')}
          </Box>
        )}

        <Typography my={1}>
          <b>Signing method:</b> <code>{method}</code>
        </Typography>

        <Typography my={2}>
          <b>Signing message:</b> {readableMessage && <CopyButton text={readableMessage} />}
        </Typography>
        <DecodedMsg message={decodedMessage} isInModal />

        <Box display="flex" alignItems="center" my={2}>
          <SvgIcon component={WarningIcon} inheritViewBox color="warning" />
          <Typography ml={1}>
            Signing a message with your Safe Account requires a transaction on the blockchain
          </Typography>
        </Box>
      </>
    </SignOrExecuteForm>
  )
}

export default ReviewSafeAppsSignMessage
