import { useTransactionType } from '@/hooks/useTransactionType'
import type { TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import { Box } from '@mui/material'
import css from './styles.module.css'
import SafeAppIconCard from '@/components/safe-apps/SafeAppIconCard'

type TxTypeProps = {
  tx: TransactionSummary
}

const TxType = ({ tx }: TxTypeProps) => {
  const type = useTransactionType(tx)

  return (
    <Box className={css.txType}>
      <SafeAppIconCard
        src={type.icon}
        alt={type.text}
        width={16}
        height={16}
        fallback="/images/transactions/custom.svg"
      />
      {type.text}
    </Box>
  )
}

export default TxType
