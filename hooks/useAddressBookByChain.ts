import { useAppSelector } from '@/store'
import { selectAddressBookByChain } from '@/store/addressBookSlice'

const useAddressBookByChain = (chainId: string) => useAppSelector((state) => selectAddressBookByChain(state, chainId))

export default useAddressBookByChain
