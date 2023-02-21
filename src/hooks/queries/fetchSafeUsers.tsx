export interface IUser {
  name: string
  address: string
}

export const fetchSafeUsers = async (address: string): Promise<IUser[]> => {
  const url = `/api/safe/users/${address}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch users from ${url}`)
  }

  const data = await response.json()
  if (data && Array.isArray(data)) {
    const users = data.map((user: any) => ({ name: user.Name, address: user.Address }))

    return users
  }
  return []
}
