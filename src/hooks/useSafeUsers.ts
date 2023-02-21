import { useEffect, useState } from 'react'
import type { IUser } from './queries/fetchSafeUsers'
import { fetchSafeUsers } from './queries/fetchSafeUsers'

export const useSafeUsers = (address: string): IUser[] => {
  const [users, setUsers] = useState<IUser[]>([])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await fetchSafeUsers(address)
        setUsers(users)
      } catch (error) {
        console.error(error)
      }
    }
    if (address) fetchUsers()
  }, [address])

  return users
}
