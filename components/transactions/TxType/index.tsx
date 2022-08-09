import { useTransactionType } from '@/hooks/useTransactionType'
import { TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { Box } from '@mui/material'
import { useState } from 'react'
import css from './styles.module.css'

type TxTypeProps = {
  tx: TransactionSummary
}

const TxType = ({ tx }: TxTypeProps) => {
  const [noIcon, setNoIcon] = useState<boolean>(false)
  const type = useTransactionType(tx)

  console.log({ tx })
  console.log(type)

  return (
    <Box className={css.txType}>
      <img
        src={noIcon ? '/images/custom.svg' : type.icon}
        alt="transaction type"
        width={16}
        height={16}
        onError={() => setNoIcon(true)}
      />
      {type.text}
    </Box>
  )
}

export default TxType
