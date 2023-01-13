import ImageFallback from '@/components/common/ImageFallback'
import { useTransactionType } from '@/hooks/useTransactionType'
import type { TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import { Box } from '@mui/material'
import css from './styles.module.css'

type TxTypeProps = {
  tx: TransactionSummary
}

const TxType = ({ tx }: TxTypeProps) => {
  const type = useTransactionType(tx)

  return (
    <Box className={css.txType}>
      <ImageFallback
        src={type.icon}
        fallbackSrc="/images/transactions/custom.svg"
        alt="Transaction type"
        width={16}
        height={16}
      />
      {type.text}
    </Box>
  )
}

export default TxType
