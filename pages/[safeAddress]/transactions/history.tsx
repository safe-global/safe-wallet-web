import type { NextPage } from 'next'
import { useAppSelector } from 'store'
import { selectTxHistory } from 'store/txHistorySlice'

const History: NextPage = () => {
  const txHistory = useAppSelector(selectTxHistory)

  return (
    <main>
      <h2>Transaction History</h2>

      <pre>{JSON.stringify(txHistory, null, 2)}</pre>
    </main>
  )
}

export default History
