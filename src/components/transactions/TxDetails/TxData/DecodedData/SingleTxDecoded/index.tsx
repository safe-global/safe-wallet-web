import { isEmptyHexData } from '@/utils/hex'
import {
  type InternalTransaction,
  Operation,
  type TransactionData,
  TokenType,
} from '@safe-global/safe-gateway-typescript-sdk'
import type { AccordionProps } from '@mui/material/Accordion/Accordion'
import { useCurrentChain } from '@/hooks/useChains'
import { safeFormatUnits } from '@/utils/formatters'
import { MethodDetails } from '@/components/transactions/TxDetails/TxData/DecodedData/MethodDetails'
import { HexEncodedData } from '@/components/transactions/HexEncodedData'
import { isDeleteAllowance, isSetAllowance } from '@/utils/transaction-guards'
import { Accordion, AccordionDetails, AccordionSummary, Stack, Typography } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import css from './styles.module.css'
import accordionCss from '@/styles/accordion.module.css'
import CodeIcon from '@mui/icons-material/Code'
import { DelegateCallWarning } from '@/components/transactions/Warning'
import SendAmountBlock from '@/components/tx-flow/flows/TokenTransfer/SendAmountBlock'
import { ZERO_ADDRESS } from '@safe-global/protocol-kit/dist/src/utils/constants'
import SendToBlock from '@/components/tx/SendToBlock'

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
  const isNativeTransfer = tx.value !== '0' && (!tx.data || isEmptyHexData(tx.data))
  const method = tx.dataDecoded?.method || (isNativeTransfer ? 'native transfer' : 'contract interaction')
  const { decimals } = chain?.nativeCurrency || {}
  const amount = tx.value ? safeFormatUnits(tx.value, decimals) : 0

  let details
  if (tx.dataDecoded) {
    details = <MethodDetails data={tx.dataDecoded} addressInfoIndex={txData.addressInfoIndex} />
  } else if (tx.data) {
    // If data is not decoded in the backend response
    details = <HexEncodedData title="Data (hex encoded)" hexData={tx.data} />
  }

  const addressInfo = txData.addressInfoIndex?.[tx.to]
  const name = addressInfo?.name
  const isDelegateCall = tx.operation === Operation.DELEGATE && showDelegateCallWarning
  const isSpendingLimitMethod = isSetAllowance(tx.dataDecoded?.method) || isDeleteAllowance(tx.dataDecoded?.method)

  return (
    <Accordion variant={variant} expanded={expanded} onChange={onChange}>
      <AccordionSummary data-testid="action-item" expandIcon={<ExpandMoreIcon />} className={accordionCss.accordion}>
        <div className={css.summary}>
          <CodeIcon color="border" fontSize="small" />
          <Typography>{actionTitle}</Typography>
          <Typography ml="8px">
            {name ? name + ': ' : ''}
            <b>{method}</b>
          </Typography>
        </div>
      </AccordionSummary>

      <AccordionDetails>
        {/* We always warn of nested delegate calls */}
        {isDelegateCall && <DelegateCallWarning showWarning={!txData.trustedDelegateCallTarget} />}
        {!isSpendingLimitMethod && (
          <Stack spacing={1}>
            {amount !== '0' && (
              <SendAmountBlock
                amount={amount}
                tokenInfo={{
                  type: TokenType.NATIVE_TOKEN,
                  address: ZERO_ADDRESS,
                  decimals: chain?.nativeCurrency.decimals ?? 18,
                  symbol: chain?.nativeCurrency.symbol ?? 'ETH',
                  logoUri: chain?.nativeCurrency.logoUri,
                }}
              />
            )}
            <SendToBlock address={tx.to} title="Interact with:" avatarSize={26} />
          </Stack>
        )}
        {details}
      </AccordionDetails>
    </Accordion>
  )
}

export default SingleTxDecoded
