import ImageFallback from '@/components/common/ImageFallback'
import { useTransactionType } from '@/hooks/useTransactionType'
import { TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
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
        src={type.icon || ''}
        fallbackSrc="/images/custom.svg"
        alt="transaction type"
        width={16}
        height={16}
      />
      {type.text}
    </Box>
  )
}

export default TxType
