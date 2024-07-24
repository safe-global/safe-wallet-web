import { GATEWAY_URL_STAGING } from '@/config/constants'

const createUserAccount = async (address: string) => {
  return await fetch(`${GATEWAY_URL_STAGING}/v1/accounts`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ address }),
  }).then((response) => response.json())
}

export const getUserAccount = async (address: string) => {
  if (!address) return

  try {
    const response = await fetch(`${GATEWAY_URL_STAGING}/v1/accounts/${address}`, { credentials: 'include' })
    if (response.ok) {
      return response.json()
    }
    if (response.status === 404) {
      return await createUserAccount(address)
    }
  } catch (error) {
    console.log(error)
  }
}
