export const submitUserVerify = async (id: string, message: string, signature: string) => {
  const data = { id: Number.parseInt(id), message, signature }

  return await fetch(`/api/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export const submitSetup = async (id: string, message: string, signature: string, safeAddress: string) => {
  const data = { id: Number.parseInt(id), message, signature, safeAddress }

  const res = await fetch(`/api/link`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res
}

export const notifyTransaction = async (txId: string, chain: string, chatId: string) => {
  const data = { txId, chain, chatId }

  return await fetch(`/api/notification/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export const fetchActiveTokens = async (safeServiceUrl: string, safeAddress: string) => {
  try {
    const res = await fetch(`${safeServiceUrl}/api/v1/safes/${safeAddress}/balances/?exclude_spam=true&trusted=true`)
    return await res.json()
  } catch (e) {
    console.error('fetchActiveTokens', e)
    return []
  }
}
