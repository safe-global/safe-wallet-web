import { ReactElement } from 'react'
import { TransactionData } from '@gnosis.pm/safe-react-gateway-sdk'
import { HexEncodedData } from '@/components/transactions/HexEncodedData'

interface Props {
  txData: TransactionData
}

// question: Can I call the multiSend method without parameters?
export const Multisend = ({ txData }: Props): ReactElement | null => {
  // const nativeCurrency = getNativeCurrency()

  // no parameters for the `multiSend`
  if (txData.dataDecoded?.parameters?.length === 0) {
    // we render the hex encoded data
    if (txData.hexData) {
      return <HexEncodedData title="Data (hex encoded)" hexData={txData.hexData} />
    }
    return null
  }

  // multiSend has one parameter `transactions` therefore `txData.dataDecoded.parameters[0]` is safe to be used here
  return (
    <>
      {/* {txData.dataDecoded?.parameters[0].valueDecoded?.map(({ dataDecoded }, index, valuesDecoded) => {
        let details
        const { data, value, to, operation } = valuesDecoded[index]

        const actionTitle = `Action ${index + 1}`
        const method = `${dataDecoded ? `${dataDecoded.method}` : ''}`
        const amount = value ? fromTokenUnit(value, nativeCurrency.decimals) : 0
        const title = getInteractionTitle(amount)

        if (dataDecoded) {
          // Backend decoded data
          details = <MethodDetails data={dataDecoded} />
        } else {
          // We couldn't decode it but we have data
          details = data && <HexEncodedData title="Data (hex encoded)" hexData={data} />
        }

        const addressInfo = txData.addressInfoIndex?.[to]
        const name = addressInfo?.name || undefined
        const avatarUrl = addressInfo?.logoUri || undefined

        return (
          <MultiSendTxGroup
            key={`${data ?? to}-${index}`}
            actionTitle={actionTitle}
            method={method}
            txDetails={{ title, address: to, dataDecoded, name, avatarUrl, operation }}
          >
            {details}
          </MultiSendTxGroup>
        )
      })} */}
    </>
  )
}

export default Multisend
