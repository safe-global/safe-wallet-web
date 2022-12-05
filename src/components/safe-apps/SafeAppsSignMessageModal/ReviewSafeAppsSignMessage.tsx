import type { ReactElement } from 'react'
import { useMemo } from 'react'
import { hashMessage, _TypedDataEncoder } from 'ethers/lib/utils'
import { Box } from '@mui/system'
import { TextField, Typography, SvgIcon } from '@mui/material'
import WarningIcon from '@/public/images/notifications/warning.svg'
import { isObjectEIP712TypedData, Methods } from '@gnosis.pm/safe-apps-sdk'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { OperationType } from '@safe-global/safe-core-sdk-types'

import SendFromBlock from '@/components/tx/SendFromBlock'
import { InfoDetails } from '@/components/transactions/InfoDetails'
import EthHashInfo from '@/components/common/EthHashInfo'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { generateDataRowValue } from '@/components/transactions/TxDetails/Summary/TxDataRow'
import type { SafeAppsSignMessageParams } from '../SafeAppsSignMessageModal'
import useChainId from '@/hooks/useChainId'
import useAsync from '@/hooks/useAsync'
import { getSignMessageLibDeploymentContractInstance } from '@/services/contracts/safeContracts'
import useTxSender from '@/hooks/useTxSender'
import { getDecodedMessage } from '../utils'

type ReviewSafeAppsSignMessageProps = {
  safeAppsSignMessage: SafeAppsSignMessageParams
}

const ReviewSafeAppsSignMessage = ({
  safeAppsSignMessage: { message, method, requestId },
}: ReviewSafeAppsSignMessageProps): ReactElement => {
  const chainId = useChainId()
  const { createTx, dispatchSafeAppsTx } = useTxSender()

  const isTextMessage = method === Methods.signMessage && typeof message === 'string'
  const isTypedMessage = method === Methods.signTypedMessage && isObjectEIP712TypedData(message)

  const signMessageDeploymentInstance = useMemo(() => getSignMessageLibDeploymentContractInstance(chainId), [chainId])
  const signMessageAddress = signMessageDeploymentInstance.address

  const readableData = useMemo(() => {
    if (isTextMessage) {
      return getDecodedMessage(message)
    } else if (isTypedMessage) {
      return JSON.stringify(message, undefined, 2)
    }
  }, [isTextMessage, isTypedMessage, message])

  const [safeTx, safeTxError] = useAsync<SafeTransaction>(() => {
    let txData

    if (isTextMessage) {
      txData = signMessageDeploymentInstance.interface.encodeFunctionData('signMessage', [
        hashMessage(getDecodedMessage(message)),
      ])
    } else if (isTypedMessage) {
      const typesCopy = { ...message.types }

      // We need to remove the EIP712Domain type from the types object
      // Because it's a part of the JSON-RPC payload, but for the `.hash` in ethers.js
      // The types are not allowed to be recursive, so ever type must either be used by another type, or be
      // the primary type. And there must only be one type that is not used by any other type.
      delete typesCopy.EIP712Domain
      txData = signMessageDeploymentInstance.interface.encodeFunctionData('signMessage', [
        _TypedDataEncoder.hash(message.domain, typesCopy, message.message),
      ])
    }

    return createTx({
      to: signMessageAddress,
      value: '0',
      data: txData || '0x',
      operation: OperationType.DelegateCall,
    })
  }, [message, createTx])

  const handleSubmit = (txId: string) => {
    dispatchSafeAppsTx(txId, requestId)
  }

  return (
    <SignOrExecuteForm safeTx={safeTx} onSubmit={handleSubmit} error={safeTxError}>
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
          <b>Signing Method:</b> <code>{method}</code>
        </Typography>

        <Typography my={2}>
          <b>Signing message:</b>
        </Typography>

        <TextField
          rows={isTextMessage ? 2 : 6}
          multiline
          disabled
          fullWidth
          sx={({ palette }) => ({
            '&& .MuiInputBase-input': {
              WebkitTextFillColor: palette.text.primary,
              fontFamily: 'monospace',
              fontSize: '0.85rem',
            },
          })}
          inputProps={{
            value: readableData,
          }}
        />

        <Box display="flex" alignItems="center" my={2}>
          <SvgIcon component={WarningIcon} inheritViewBox color="warning" />
          <Typography ml={1}>Signing a message with the Safe requires a transaction on the blockchain</Typography>
        </Box>
      </>
    </SignOrExecuteForm>
  )
}

export default ReviewSafeAppsSignMessage
