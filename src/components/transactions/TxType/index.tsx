import { useTransactionType } from '@/hooks/useTransactionType'
import type { TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import { TransactionInfoType, TransferDirection } from '@safe-global/safe-gateway-typescript-sdk'
import { Box } from '@mui/material'
import css from './styles.module.css'
import SafeAppIconCard from '@/components/safe-apps/SafeAppIconCard'
import { HumanDescription, TransferDescription } from '@/components/transactions/HumanDescription'
import useABTesting from '@/services/tracking/useAbTesting'
import { AbTest } from '@/services/tracking/abTesting'

type TxTypeProps = {
  tx: TransactionSummary
  short?: boolean
}

const TxType = ({ tx, short = false }: TxTypeProps) => {
  const type = useTransactionType(tx)
  const shouldDisplayHumanDescription = useABTesting(AbTest.HUMAN_DESCRIPTION)

  const humanDescription = tx.txInfo.richDecodedInfo?.fragments

  return (
    <Box className={css.txType}>
      <SafeAppIconCard
        src={type.icon}
        alt={type.text}
        width={16}
        height={16}
        fallback="/images/transactions/custom.svg"
      />
      {humanDescription && shouldDisplayHumanDescription && !short ? (
        <HumanDescription fragments={humanDescription} />
      ) : tx.txInfo.type === TransactionInfoType.TRANSFER && shouldDisplayHumanDescription && !short ? (
        <TransferDescription isSendTx={tx.txInfo.direction === TransferDirection.OUTGOING} txInfo={tx.txInfo} />
      ) : (
        type.text
      )}
    </Box>
  )
}

export default TxType
