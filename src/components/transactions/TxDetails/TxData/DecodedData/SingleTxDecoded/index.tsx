import { type InternalTransaction, Operation, type TransactionData } from '@safe-global/safe-gateway-typescript-sdk'
import type { AccordionProps } from '@mui/material/Accordion/Accordion'
import { useCurrentChain } from '@/hooks/useChains'
import { formatVisualAmount } from '@/utils/formatters'
import { MethodDetails } from '@/components/transactions/TxDetails/TxData/DecodedData/MethodDetails'
import { HexEncodedData } from '@/components/transactions/HexEncodedData'
import { isDeleteAllowance, isSetAllowance } from '@/utils/transaction-guards'
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import css from './styles.module.css'
import accordionCss from '@/styles/accordion.module.css'
import CodeIcon from '@mui/icons-material/Code'
import { DelegateCallWarning } from '@/components/transactions/Warning'
import { InfoDetails } from '@/components/transactions/InfoDetails'
import EthHashInfo from '@/components/common/EthHashInfo'

type SingleTxDecodedProps = {
  tx: InternalTransaction
  txData: TransactionData
  actionTitle: string
  showDelegateCallWarning: boolean
  variant?: AccordionProps['variant']
  expanded?: boolean
  onChange?: AccordionProps['onChange']
}

export const SingleTxDecoded = ({
  tx,
  txData,
  actionTitle,
  showDelegateCallWarning,
  variant,
  expanded,
  onChange,
}: SingleTxDecodedProps) => {
  const chain = useCurrentChain()
  const method = tx.dataDecoded?.method || ''
  const { decimals, symbol } = chain?.nativeCurrency || {}
  const amount = tx.value ? formatVisualAmount(tx.value, decimals) : 0

  let details
  if (tx.dataDecoded) {
    details = <MethodDetails data={tx.dataDecoded} addressInfoIndex={txData.addressInfoIndex} />
  } else if (tx.data) {
    // If data is not decoded in the backend response
    details = <HexEncodedData title="Data (hex encoded)" hexData={tx.data} />
  }

  const addressInfo = txData.addressInfoIndex?.[tx.to]
  const name = addressInfo?.name
  const avatarUrl = addressInfo?.logoUri

  const title = `Interact with${Number(amount) !== 0 ? ` (and send ${amount} ${symbol} to)` : ''}:`
  const isDelegateCall = tx.operation === Operation.DELEGATE && showDelegateCallWarning
  const isSpendingLimitMethod = isSetAllowance(tx.dataDecoded?.method) || isDeleteAllowance(tx.dataDecoded?.method)

  return (
    <Accordion variant={variant} expanded={expanded} onChange={onChange}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} className={accordionCss.accordion}>
        <div className={css.summary}>
          <CodeIcon color="border" fontSize="small" />
          <Typography>{actionTitle}</Typography>
          <Typography ml="8px">
            {name ? name + ': ' : ''}
            <b>{method || 'native transfer'}</b>
          </Typography>
        </div>
      </AccordionSummary>

      <AccordionDetails>
        {/* We always warn of nested delegate calls */}
        {isDelegateCall && <DelegateCallWarning showWarning={!txData.trustedDelegateCallTarget} />}
        {!isSpendingLimitMethod && (
          <InfoDetails title={title}>
            <EthHashInfo
              address={tx.to}
              name={name}
              customAvatar={avatarUrl}
              shortAddress={false}
              showCopyButton
              hasExplorer
            />
          </InfoDetails>
        )}
        {details}
      </AccordionDetails>
    </Accordion>
  )
}

export default SingleTxDecoded
