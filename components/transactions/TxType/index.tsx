import Identicon from '@/components/common/Identicon'
import { useTransactionType } from '@/hooks/useTransactionType'
import { isCustomTxInfo } from '@/utils/transaction-guards'
import { TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { Box } from '@mui/material'
import { useState } from 'react'
import css from './styles.module.css'

type TxTypeProps = {
  tx: TransactionSummary
}

const TxType = ({ tx }: TxTypeProps) => {
  const [fallbackToIdenticon, setFallbackToIdenticon] = useState(false)
  const type = useTransactionType(tx)

  return (
    <Box className={css.txType}>
      {!fallbackToIdenticon ? (
        <img
          src={type.icon}
          alt="transaction type"
          width={16}
          height={16}
          onError={() => setFallbackToIdenticon(true)}
        />
      ) : (
        <Identicon address={isCustomTxInfo(tx.txInfo) ? tx.txInfo.to.value : ''} size={24} />
      )}
      {type.text}
    </Box>
  )
}

export default TxType
