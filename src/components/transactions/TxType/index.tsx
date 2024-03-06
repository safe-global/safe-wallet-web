import SafeAppIconCard from '@/components/safe-apps/SafeAppIconCard'
import { useTransactionType } from '@/hooks/useTransactionType'
import { Box } from '@mui/material'
import type { TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import css from './styles.module.css'

type TxTypeProps = {
  tx: TransactionSummary
}

const TxType = ({ tx }: TxTypeProps) => {
  const type = useTransactionType(tx)

  return (
    <Box data-sid="30552" className={css.txType}>
      <SafeAppIconCard
        src={type.icon}
        alt={type.text}
        width={16}
        height={16}
        fallback="/images/transactions/custom.svg"
      />
      <span className={css.txTypeText}>{type.text}</span>
    </Box>
  )
}

export default TxType
