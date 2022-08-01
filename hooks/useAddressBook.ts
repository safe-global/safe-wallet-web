import { useAppSelector } from '@/store'
import { selectAddressBookByChain } from '@/store/addressBookSlice'
import useChainId from './useChainId'

const useAddressBook = () => {
  const chainId = useChainId()
  return useAppSelector((state) => selectAddressBookByChain(state, chainId))
}

export default useAddressBook
