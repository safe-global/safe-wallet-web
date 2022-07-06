import { useAppSelector } from '@/store'
import { selectAllAddressBooks } from '@/store/addressBookSlice'
import useSafeInfo from '@/hooks/useSafeInfo'

const useAddressBook = () => {
  const { data: safe } = useSafeInfo()
  const allAddressBooks = useAppSelector(selectAllAddressBooks)
  const chainId = safe?.chainId
  return chainId ? allAddressBooks[chainId] || {} : {}
}

export default useAddressBook
