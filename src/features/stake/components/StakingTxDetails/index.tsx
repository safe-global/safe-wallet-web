import { Box, Typography } from '@mui/material'
import type { StakingTxInfo, TransactionData } from '@safe-global/safe-gateway-typescript-sdk'
import FieldsGrid from '@/components/tx/FieldsGrid'
import TxStatusChip from '@/components/transactions/TxStatusChip'
import SendAmountBlock from '@/components/tx-flow/flows/TokenTransfer/SendAmountBlock'
import { formatSecondsDuration } from '@/utils/formatters'

const StakingTxDetails = ({ info, txData }: { info: StakingTxInfo; txData?: TransactionData }) => {
  return (
    <Box pl={1} pr={5} display="flex" flexDirection="column" gap={1}>
      {txData && (
        <SendAmountBlock title="Deposit" amountInWei={txData.value?.toString() || '0'} tokenInfo={info.tokenInfo} />
      )}

      <FieldsGrid title="Net rewards">{info.annualNrr.toFixed(3)}%</FieldsGrid>
      <FieldsGrid title="Fee">{info.fee}%</FieldsGrid>

      <Box borderTop="1px solid" borderColor="border.light" my={1} />

      <FieldsGrid title="Validators">{info.numValidators || 'N/A'}</FieldsGrid>
      <FieldsGrid title="Active in">{formatSecondsDuration(info.estimatedEntryTime)}</FieldsGrid>
      <FieldsGrid title="Rewards">Approx. every 5 days after 4 days from activation</FieldsGrid>
      <FieldsGrid title="Status">
        <TxStatusChip>{info.status.toLowerCase().replace(/_/g, ' ')}</TxStatusChip>
      </FieldsGrid>

      <Typography variant="body2" color="text.secondary" mt={2}>
        Earn ETH rewards with dedicated validators. Rewards must be withdrawn manually, and you can request a withdrawal
        at any time.
      </Typography>
    </Box>
  )
}

export default StakingTxDetails
