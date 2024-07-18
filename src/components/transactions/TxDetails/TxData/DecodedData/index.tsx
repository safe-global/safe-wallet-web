import type { ReactElement } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import { TokenType, type TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'

import { HexEncodedData } from '@/components/transactions/HexEncodedData'
import { MethodDetails } from '@/components/transactions/TxDetails/TxData/DecodedData/MethodDetails'
import { useCurrentChain } from '@/hooks/useChains'
import SendAmountBlock from '@/components/tx-flow/flows/TokenTransfer/SendAmountBlock'
import { ZERO_ADDRESS } from '@safe-global/protocol-kit/dist/src/utils/constants'
import { isCustomTxInfo } from '@/utils/transaction-guards'
import EthHashInfo from '@/components/common/EthHashInfo'

interface Props {
  txData: TransactionDetails['txData']
  txInfo: TransactionDetails['txInfo']
}

export const DecodedData = ({ txData, txInfo }: Props): ReactElement | null => {
  const chainInfo = useCurrentChain()
  // nothing to render
  if (!txData) {
    return null
  }

  const method = txData.dataDecoded?.method || ''

  let decodedData = <></>
  if (txData.dataDecoded) {
    decodedData = <MethodDetails data={txData.dataDecoded} addressInfoIndex={txData.addressInfoIndex} />
  } else if (txData.hexData) {
    // When no decoded data, display raw hex data
    decodedData = <HexEncodedData title="Data (hex encoded)" hexData={txData.hexData} />
  }

  const amountInWei = txData.value ?? '0'
  // we render the decoded data
  return (
    <Stack spacing={1}>
      {amountInWei !== '0' && (
        <SendAmountBlock
          amountInWei={amountInWei}
          tokenInfo={{
            type: TokenType.NATIVE_TOKEN,
            address: ZERO_ADDRESS,
            decimals: chainInfo?.nativeCurrency.decimals ?? 18,
            symbol: chainInfo?.nativeCurrency.symbol ?? 'ETH',
            logoUri: chainInfo?.nativeCurrency.logoUri,
          }}
        />
      )}

      <Typography fontWeight="bold" display="flex" alignItems="center" gap=".5em" pb={1.5}>
        Call{' '}
        <Typography
          component="code"
          variant="body2"
          sx={{
            backgroundColor: 'background.main',
            px: 1,
            py: 0.5,
            borderRadius: 0.5,
            fontFamily: 'monospace',
          }}
        >
          {method}
        </Typography>{' '}
        on
        <EthHashInfo
          address={txData.to.value}
          name={isCustomTxInfo(txInfo) ? txInfo.to.name : undefined}
          onlyName
          hasExplorer
          showCopyButton
          avatarSize={26}
        />
      </Typography>

      {/* Divider */}
      <Box
        borderBottom="1px solid var(--color-border-light)"
        width="calc(100% + 32px)"
        sx={{ ml: '-16px !important' }}
      />

      {decodedData}
    </Stack>
  )
}

export default DecodedData
