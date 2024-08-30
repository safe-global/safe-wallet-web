import { Box } from '@mui/material'
import type { StakingTxInfo, TransactionData } from '@safe-global/safe-gateway-typescript-sdk'
import FieldsGrid from '@/components/tx/FieldsGrid'
import SendAmountBlock from '@/components/tx-flow/flows/TokenTransfer/SendAmountBlock'
import StakingOrderConfirmationView from '@/features/stake/components/StakingOrderConfirmationView'

const StakingTxDetails = ({ info, txData }: { info: StakingTxInfo; txData?: TransactionData }) => {
  return (
    <Box pl={1} pr={5} display="flex" flexDirection="column" gap={1}>
      {txData && (
        <SendAmountBlock title="Deposit" amountInWei={txData.value?.toString() || '0'} tokenInfo={info.tokenInfo} />
      )}

      <FieldsGrid title="Net reward rate">{info.annualNrr.toFixed(3)}%</FieldsGrid>

      <StakingOrderConfirmationView order={info} />
    </Box>
  )
}

export default StakingTxDetails
