import { ReactElement, useMemo } from 'react'
import { hashMessage, _TypedDataEncoder } from 'ethers/lib/utils'
import { Box } from '@mui/system'
import { TextField, Typography } from '@mui/material'
import WarningIcon from '@mui/icons-material/Warning'
import { isObjectEIP712TypedData, Methods } from '@gnosis.pm/safe-apps-sdk'
import { OperationType, SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'

import SendFromBlock from '@/components/tx/SendFromBlock'
import { InfoDetails } from '@/components/transactions/InfoDetails'
import EthHashInfo from '@/components/common/EthHashInfo'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { generateDataRowValue } from '@/components/transactions/TxDetails/Summary/TxDataRow'
import { SafeAppsSignMessageParams } from '../SafeAppsSignMessageModal'
import useChainId from '@/hooks/useChainId'
import useAsync from '@/hooks/useAsync'
import useSafeInfo from '@/hooks/useSafeInfo'
import { getSignMessageLibDeploymentContractInstance } from '@/services/contracts/safeContracts'
import { createTx } from '@/services/tx/txSender'
import { convertToHumanReadableMessage } from '../utils'
import { dispatchSafeAppsTx } from '@/services/tx/txSender'

type ReviewSafeAppsSignMessageProps = {
  onSubmit: (data: null) => void
  safeAppsSignMessage: SafeAppsSignMessageParams
}

const ReviewSafeAppsSignMessage = ({
  onSubmit,
  safeAppsSignMessage: { message, method, requestId },
}: ReviewSafeAppsSignMessageProps): ReactElement => {
  const { safe } = useSafeInfo()
  const chainId = useChainId()

  const isTextMessage = method === Methods.signMessage && typeof message === 'string'
  const isTypedMessage = method === Methods.signTypedMessage && isObjectEIP712TypedData(message)

  const signMessageDeploymentInstance = useMemo(() => getSignMessageLibDeploymentContractInstance(chainId), [chainId])
  const signMessageAddress = signMessageDeploymentInstance.address

  const canExecute = safe.threshold === 1

  const readableData = useMemo(() => {
    if (isTextMessage) {
      return convertToHumanReadableMessage(message)
    } else if (isTypedMessage) {
      return JSON.stringify(message, undefined, 2)
    }
  }, [isTextMessage, isTypedMessage, message])

  const [safeTx, safeTxError] = useAsync<SafeTransaction>(() => {
    let txData

    if (isTextMessage) {
      txData = signMessageDeploymentInstance.interface.encodeFunctionData('signMessage', [hashMessage(message)])
    } else if (isTypedMessage) {
      txData = signMessageDeploymentInstance.interface.encodeFunctionData('signMessage', [
        _TypedDataEncoder.hash(message.domain, message.types, message.message),
      ])
    }

    return createTx({
      to: signMessageAddress,
      value: '0',
      data: txData || '0x',
      operation: OperationType.DelegateCall,
    })
  }, [])

  const handleSubmit = (txId: string) => {
    dispatchSafeAppsTx(txId, requestId)
    onSubmit(null)
  }

  return (
    <SignOrExecuteForm
      safeTx={safeTx}
      isExecutable={canExecute}
      onSubmit={handleSubmit}
      error={safeTxError}
      redirectToTx={false}
    >
      <>
        <SendFromBlock />

        <InfoDetails title="Interact with SignMessageLib">
          <EthHashInfo address={signMessageAddress} shortAddress={false} showCopyButton hasExplorer />
        </InfoDetails>

        {safeTx && (
          <Box pb={1}>
            <Typography mt={2} color="secondary.light">
              Data (hex encoded)
            </Typography>
            {generateDataRowValue(safeTx.data.data, 'rawData')}
          </Box>
        )}

        <Typography sx={{ my: 1 }}>
          <b>Signing Method:</b> <code>{method}</code>
        </Typography>

        <Typography sx={{ my: 2 }}>
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
          <WarningIcon color="warning" />
          <Typography sx={{ ml: 1 }}>
            Signing a message with the Safe requires a transaction on the blockchain
          </Typography>
        </Box>
      </>
    </SignOrExecuteForm>
  )
}

export default ReviewSafeAppsSignMessage
