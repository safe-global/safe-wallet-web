import { useAppSelector } from '@/store'
import { selectAddressBook } from '@/store/addressBookSlice'

const useAddressBook = () => useAppSelector(selectAddressBook)

export default useAddressBook
