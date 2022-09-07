import { ReactElement } from 'react'
import SendFromBlock from '@/components/tx/SendFromBlock'
import { InfoDetails } from '@/components/transactions/InfoDetails'
import EthHashInfo from '@/components/common/EthHashInfo'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { SafeAppsSignMessageParams } from '../SafeAppsSignMessageModal'
import useChainId from '@/hooks/useChainId'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useCurrentChain } from '@/hooks/useChains'
import { getSignMessageLibDeploymentContractInstance } from '@/services/contracts/safeContracts'
import { isObjectEIP712TypedData, Methods } from '@gnosis.pm/safe-apps-sdk'
import { hashMessage, _TypedDataEncoder } from 'ethers/lib/utils'
import { convertToHumanReadableMessage } from '../utils'
import useAsync from '@/hooks/useAsync'
import { OperationType, SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import { createTx } from '@/services/tx/txSender'
import { TextField, Typography } from '@mui/material'
import { Box } from '@mui/system'

type ReviewSafeAppsSignMessageProps = {
  onSubmit: (data: null) => void
  safeAppsSignMessage: SafeAppsSignMessageParams
}

const ReviewSafeAppsSignMessage = ({
  onSubmit,
  safeAppsSignMessage: { message, method, requestId },
}: ReviewSafeAppsSignMessageProps): ReactElement => {
  const chainId = useChainId()
  const chain = useCurrentChain()
  const { safe } = useSafeInfo()

  const isTextMessage = method === Methods.signMessage && typeof message === 'string'
  const isTypedMessage = method === Methods.signTypedMessage && isObjectEIP712TypedData(message)

  const signMessageDeploymentInstance = getSignMessageLibDeploymentContractInstance(chainId)
  const signMessageAddress = signMessageDeploymentInstance.address

  let txData, readableData

  if (isTextMessage) {
    readableData = convertToHumanReadableMessage(message)
  } else if (isTypedMessage) {
    readableData = JSON.stringify(message, undefined, 2)
  } else {
    console.error('Unsupported method or message type', method, message)
  }

  const [safeTx, safeTxError] = useAsync<SafeTransaction>(() => {
    let txData

    if (method == Methods.signMessage && typeof message === 'string') {
      txData = signMessageDeploymentInstance.interface.encodeFunctionData('signMessage', [hashMessage(message)])
    } else if (method == Methods.signTypedMessage && isObjectEIP712TypedData(message)) {
      txData = signMessageDeploymentInstance.interface.encodeFunctionData('signMessage', [
        _TypedDataEncoder.hash(message.domain, message.types, message.message),
      ])
    }

    console.log('tx', {
      to: signMessageAddress,
      value: '0',
      data: txData || '0x',
      operation: OperationType.DelegateCall,
    })

    return createTx({
      to: signMessageAddress,
      value: '0',
      data: txData || '0x',
      operation: OperationType.DelegateCall,
    })
  }, [])

  safeTx && console.log('safeTx', safeTx)
  safeTxError && console.log('safeTxError', safeTxError)

  return (
    <SignOrExecuteForm safeTx={safeTx} isExecutable onSubmit={onSubmit} requestId={requestId} error={safeTxError}>
      <>
        <SendFromBlock />

        <InfoDetails title="Interact with SignMessageLib">
          <EthHashInfo address={signMessageAddress} shortAddress={false} showCopyButton hasExplorer />
        </InfoDetails>

        <Box py={1}>
          <Typography>
            <b>Signing Method:</b> {method}
          </Typography>
        </Box>

        <Box pt={1} pb={2}>
          <Typography pb={1}>
            <b>Signing message:</b>
          </Typography>

          <TextField
            rows={isTextMessage ? 2 : 6}
            multiline
            disabled
            fullWidth
            sx={({ palette }) => ({
              '&& .MuiInputBase-input': {
                '-webkit-text-fill-color': palette.text.primary,
                fontFamily: 'monospace',
                fontSize: '0.85rem',
              },
            })}
            inputProps={{
              value: readableData,
            }}
          />
        </Box>
      </>
    </SignOrExecuteForm>
  )
}

export default ReviewSafeAppsSignMessage
