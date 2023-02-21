export interface Transaction {
  data: string
  to: string
  value: string
}

export const fetchStreamTransactions = async (
  tokenContract: {
    address: string
    symbol: string
    name: string
    decimals: number
    contract: {
      id: string
    }
  },
  amount: string,
  recipient: string,
  duration: string,
): Promise<Transaction[]> => {
  const url = '/api/safe/encode'
  const body = { tokenContract, amount: Number(amount), recipient, duration, period: 1 }
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch stream transactions from ${url}`)
  }

  const data = await response.json()
  const transactions = data.map((tx: any) => ({
    data: tx.data,
    to: tx.to,
    value: tx.value,
  }))

  return transactions
}
