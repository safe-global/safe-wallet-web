import { ReactElement } from 'react'
import { DecodedDataResponse, getDecodedData, Operation } from '@gnosis.pm/safe-react-gateway-sdk'
import { OperationType, SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import { Box, Typography } from '@mui/material'
import SendFromBlock from '@/components/tx/SendFromBlock'
import Multisend from '@/components/transactions/TxDetails/TxData/DecodedData/Multisend'
import { InfoDetails } from '@/components/transactions/InfoDetails'
import EthHashInfo from '@/components/common/EthHashInfo'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { generateDataRowValue } from '@/components/transactions/TxDetails/Summary/TxDataRow'
import useAsync from '@/hooks/useAsync'
import useChainId from '@/hooks/useChainId'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useCurrentChain } from '@/hooks/useChains'
import { createMultiSendCallOnlyTx } from '@/services/tx/txSender'
import { getInteractionTitle } from '../utils'
import { SafeAppsTxParams } from '.'
import { isEmptyHexData } from '@/utils/hex'
import { dispatchSafeAppsTx } from '@/services/tx/txSender'

type ReviewSafeAppsTxProps = {
  safeAppsTx: SafeAppsTxParams
}

const ReviewSafeAppsTx = ({ safeAppsTx: { txs, requestId, params } }: ReviewSafeAppsTxProps): ReactElement => {
  const chainId = useChainId()
  const chain = useCurrentChain()
  const { safe } = useSafeInfo()

  const isMultiSend = txs.length > 1
  const canExecute = safe.threshold === 1

  const [safeTx, safeTxError] = useAsync<SafeTransaction>(async () => {
    const tx = await createMultiSendCallOnlyTx(txs)

    if (params?.safeTxGas) {
      // @ts-expect-error safeTxGas readonly
      tx.data.safeTxGas = params.safeTxGas
    }

    return tx
  }, [])

  const [decodedData] = useAsync<DecodedDataResponse | undefined>(async () => {
    if (!safeTx || isEmptyHexData(safeTx.data.data)) return

    return getDecodedData(chainId, safeTx.data.data)
  }, [safeTx])

  const handleSubmit = (txId: string) => {
    dispatchSafeAppsTx(txId, requestId)
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

        {safeTx && (
          <>
            <InfoDetails title={getInteractionTitle(safeTx.data.value || '', chain)}>
              <EthHashInfo address={safeTx.data.to} shortAddress={false} showCopyButton hasExplorer />
            </InfoDetails>

            {safeTx && (
              <Box pb={2}>
                <Typography mt={2} color="secondary.light">
                  Data (hex encoded)
                </Typography>
                {generateDataRowValue(safeTx.data.data, 'rawData')}
              </Box>
            )}

            {isMultiSend && (
              <Box py={1}>
                <Multisend
                  txData={{
                    dataDecoded: decodedData,
                    to: { value: safeTx.data.to },
                    value: safeTx.data.value,
                    operation: safeTx.data.operation === OperationType.Call ? Operation.CALL : Operation.DELEGATE,
                    trustedDelegateCallTarget: false,
                  }}
                />
              </Box>
            )}
          </>
        )}
      </>
    </SignOrExecuteForm>
  )
}

export default ReviewSafeAppsTx
