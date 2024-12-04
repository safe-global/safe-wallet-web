import Stack from '@mui/material/Stack'
import SvgIcon from '@mui/material/SvgIcon'
import Typography from '@mui/material/Typography'
import { type TransactionData } from '@safe-global/safe-gateway-typescript-sdk'

import { Divider } from '@/components/tx/DecodedTx'

import NestedTransactionIcon from '@/public/images/transactions/nestedTx.svg'
import { type ReactElement } from 'react'
import MethodCall from '../DecodedData/MethodCall'
import { MethodDetails } from '../DecodedData/MethodDetails'

export const NestedTransaction = ({
  txData,
  children,
  isConfirmationView = false,
}: {
  txData: TransactionData | undefined
  children: ReactElement
  isConfirmationView?: boolean
}) => {
  return (
    <Stack spacing={2}>
      {!isConfirmationView && txData?.dataDecoded && (
        <>
          <MethodCall contractAddress={txData.to.value} method={txData.dataDecoded.method} />
          <MethodDetails data={txData.dataDecoded} addressInfoIndex={txData.addressInfoIndex} />
          <Divider />
        </>
      )}

      <Stack spacing={2}>
        <Typography variant="h5" display="flex" alignItems="center" gap={1}>
          <SvgIcon component={NestedTransactionIcon} inheritViewBox fontSize="small" /> Nested transaction:
        </Typography>
        {children}
      </Stack>
    </Stack>
  )
}
