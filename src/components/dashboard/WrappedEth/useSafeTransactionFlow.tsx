import { useCallback, useContext } from 'react'
import { TxModalContext } from '@/components/tx-flow'
import SafeAppsTxFlow from '@/components/tx-flow/flows/SafeAppsTx'

type EthTransaction = {
  to: string
  value: string
  data: string
}

const useSafeTransactionFlow = (): ((tx: EthTransaction) => void) => {
  const { setTxFlow } = useContext(TxModalContext)

  const onTxSubmit = useCallback(
    (tx: EthTransaction) => {
      setTxFlow(
        <SafeAppsTxFlow
          data={{
            requestId: Math.random().toString(36).slice(2),
            txs: [tx],
            params: { safeTxGas: 0 },
            app: {
              name: 'Wrapped ETH',
              iconUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2396.png',
            },
          }}
        />,
      )
    },
    [setTxFlow],
  )

  return onTxSubmit
}

export default useSafeTransactionFlow
