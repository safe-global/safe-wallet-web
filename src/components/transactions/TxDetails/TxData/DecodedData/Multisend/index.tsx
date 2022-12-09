import { HexEncodedData } from '@/components/transactions/HexEncodedData'
import type { TransactionData } from '@safe-global/safe-gateway-typescript-sdk'
import type { ReactElement } from 'react'
import type { AccordionProps } from '@mui/material/Accordion/Accordion'
import SingleTxDecoded from '@/components/transactions/TxDetails/TxData/DecodedData/SingleTxDecoded'

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
        return (
          <SingleTxDecoded
            key={`${data ?? to}-${index}`}
            tx={{
              dataDecoded,
              data,
              value,
              to,
              operation,
            }}
            txData={txData}
            showDelegateCallWarning={showDelegateCallWarning}
            actionTitle={`Action ${index + 1}`}
            variant={variant}
          />
        )
      })}
    </>
  )
}

export default Multisend
