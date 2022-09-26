import ImageFallback from '@/components/common/ImageFallback'
import { useTransactionType } from '@/hooks/useTransactionType'
import { isTransferTxInfo, isERC721Transfer } from '@/utils/transaction-guards'
import { TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { Box } from '@mui/material'
import css from './styles.module.css'

type TxTypeProps = {
  tx: TransactionSummary
}

const TxType = ({ tx }: TxTypeProps) => {
  const type = useTransactionType(tx)

  const fallbackSrc =
    isTransferTxInfo(tx.txInfo) && isERC721Transfer(tx.txInfo?.transferInfo)
      ? '/images/nft-placeholder.png'
      : '/images/custom.svg'

  return (
    <Box className={css.txType}>
      <ImageFallback src={type.icon} fallbackSrc={fallbackSrc} alt="Transaction type" width={16} height={16} />
      {type.text}
    </Box>
  )
}

export default TxType
