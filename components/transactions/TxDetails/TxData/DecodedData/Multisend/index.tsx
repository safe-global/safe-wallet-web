import { ReactElement } from 'react'
import { DataDecoded, TransactionData } from '@gnosis.pm/safe-react-gateway-sdk'
import { HexEncodedData } from '@/components/transactions/HexEncodedData'
import { camelCaseToSpaces, toDecimals } from '@/utils/formatters'
import { useCurrentChain } from '@/hooks/useChains'
import { Box, Typography } from '@mui/material'
import { TxDataRow } from '@/components/transactions/TxDetails/Summary/TxDataRow'
import { generateDataRowValue } from '@/components/transactions/TxDetails/Summary'

export const MethodDetails = ({ data }: { data: DataDecoded }): React.ReactElement => {
  const isArrayParameter = (parameter: string): boolean => /(\[\d*])+$/.test(parameter)
  const isAddress = (type: string): boolean => type.indexOf('address') === 0
  const isByte = (type: string): boolean => type.indexOf('byte') === 0
  const methodName = camelCaseToSpaces(data.method)
  return (
    <Box py="8px">
      <Typography variant="body2" sx={{ textTransform: 'uppercase', letterSpacing: '1px', color: 'rgb(93, 109, 116)' }}>
        <b>{methodName}</b>
      </Typography>

      {data.parameters?.map((param, index) => {
        const isArrayValueParam = isArrayParameter(param.type) || Array.isArray(param.value)
        const inlineType = isAddress(param.type) ? 'address' : isByte(param.type) ? 'bytes' : undefined
        const value = `${param.value}`
        return (
          <TxDataRow key={`${data.method}_param-${index}`} title={`${param.name}(${param.type}):`}>
            {generateDataRowValue(value, inlineType)}
          </TxDataRow>
        )
      })}
    </Box>
  )
}

interface Props {
  txData: TransactionData
}

export const Multisend = ({ txData }: Props): ReactElement | null => {
  const chain = useCurrentChain()

  // ? when can a multiSend call take no parameters? - maybe this condition does not make sense
  if (!txData.dataDecoded?.parameters) {
    if (txData.hexData) {
      return <HexEncodedData title="Data (hex encoded)" hexData={txData.hexData} />
    }
    return null
  }

  // multiSend has one parameter `transactions` therefore `txData.dataDecoded.parameters[0]` is safe to be used here
  return (
    <>
      {txData.dataDecoded?.parameters[0].valueDecoded?.map(({ dataDecoded, data, value, to, operation }, index) => {
        const actionTitle = `Action ${index + 1}`
        const { method } = dataDecoded || {}
        const { decimals, symbol } = chain!.nativeCurrency
        const amount = value ? toDecimals(value, decimals) : 0

        let details
        if (dataDecoded) {
          details = <MethodDetails data={dataDecoded} />
        } else {
          // If data is not decoded in the backend response
          details = data && <HexEncodedData title="Data (hex encoded)" hexData={data} />
        }

        const addressInfo = txData.addressInfoIndex?.[to]
        const name = addressInfo?.name || undefined
        const avatarUrl = addressInfo?.logoUri || undefined

        const title = `Interact with${Number(amount) === 0 && ` (and send ${amount} ${symbol} to)`}:`
        return (
          <>{details}</>
          // <MultiSendTxGroup
          //   key={`${data ?? to}-${index}`}
          //   actionTitle={actionTitle}
          //   method={method}
          //   txDetails={{ title, address: to, dataDecoded, name, avatarUrl, operation }}
          // >
          //   {details}
          // </MultiSendTxGroup>
        )
      })}
    </>
  )
}

export default Multisend
