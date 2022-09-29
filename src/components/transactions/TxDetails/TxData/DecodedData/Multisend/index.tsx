import { HexEncodedData } from '@/components/transactions/HexEncodedData'
import { MethodDetails } from '@/components/transactions/TxDetails/TxData/DecodedData/MethodDetails'
import { useCurrentChain } from '@/hooks/useChains'
import { formatVisualAmount } from '@/utils/formatters'
import { Operation, TransactionData } from '@gnosis.pm/safe-react-gateway-sdk'
import { ReactElement } from 'react'
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import css from '@/components/transactions/TxDetails/TxData/DecodedData/Multisend/styles.module.css'
import CodeIcon from '@mui/icons-material/Code'
import { DelegateCallWarning } from '@/components/transactions/Warning'
import { InfoDetails } from '@/components/transactions/InfoDetails'
import EthHashInfo from '@/components/common/EthHashInfo'
import { isDeleteAllowance, isSetAllowance } from '@/utils/transaction-guards'
import { AccordionProps } from '@mui/material/Accordion/Accordion'

type MultisendProps = {
  txData?: TransactionData
  variant?: AccordionProps['variant']
  showDelegateCallWarning?: boolean
}

export const Multisend = ({
  txData,
  variant = 'elevation',
  showDelegateCallWarning = true,
}: MultisendProps): ReactElement | null => {
  const chain = useCurrentChain()

  if (!txData) return null

  // ? when can a multiSend call take no parameters?
  if (!txData.dataDecoded?.parameters) {
    if (txData.hexData) {
      return <HexEncodedData title="Data (hex encoded)" hexData={txData.hexData} />
    }
    return null
  }

  // multiSend method receives one parameter `transactions`
  return (
    <>
      {txData.dataDecoded?.parameters[0].valueDecoded?.map(({ dataDecoded, data, value, to, operation }, index) => {
        const actionTitle = `Action ${index + 1}`
        const method = dataDecoded?.method || ''
        const { decimals, symbol } = chain!.nativeCurrency
        const amount = value ? formatVisualAmount(value, decimals) : 0

        let details
        if (dataDecoded) {
          details = <MethodDetails data={dataDecoded} />
        } else if (data) {
          // If data is not decoded in the backend response
          details = <HexEncodedData title="Data (hex encoded)" hexData={data} />
        }

        const addressInfo = txData.addressInfoIndex?.[to]
        const name = addressInfo?.name
        const avatarUrl = addressInfo?.logoUri

        const title = `Interact with${Number(amount) !== 0 ? ` (and send ${amount} ${symbol} to)` : ''}:`
        const isDelegateCall = operation === Operation.DELEGATE && showDelegateCallWarning
        const isSpendingLimitMethod = isSetAllowance(dataDecoded?.method) || isDeleteAllowance(dataDecoded?.method)

        return (
          <Accordion key={`${data ?? to}-${index}`} variant={variant} defaultExpanded={isDelegateCall}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <div className={css.summary}>
                <CodeIcon />
                <Typography>{actionTitle}</Typography>
                <Typography ml="8px">
                  <b>{method}</b>
                </Typography>
              </div>
            </AccordionSummary>

            <AccordionDetails>
              {/* We always warn of nested delegate calls */}
              {isDelegateCall && <DelegateCallWarning showWarning={!txData.trustedDelegateCallTarget} />}
              {!isSpendingLimitMethod && (
                <InfoDetails title={title}>
                  <EthHashInfo
                    address={to}
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
      })}
    </>
  )
}

export default Multisend
