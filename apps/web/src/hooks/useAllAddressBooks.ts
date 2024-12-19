import { useAppSelector } from '@/store'
import { selectAllAddressBooks } from '@/store/addressBookSlice'

const useAllAddressBooks = () => {
  return useAppSelector(selectAllAddressBooks)
}

export default useAllAddressBooks
