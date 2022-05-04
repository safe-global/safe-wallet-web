import { OwnerList } from '@/components/settings/owner/OwnerList'
import useAddressBook from '@/services/useAddressBook'
import useSafeInfo from '@/services/useSafeInfo'
import { truncate } from 'fs/promises'
import type { NextPage } from 'next'

const Owners: NextPage = () => {
  const { safe } = useSafeInfo()
  const addressBook = useAddressBook()
  const namedOwners = safe?.owners.map((owner) => ({
    address: owner.value,
    name: addressBook[owner.value],
  }))
  return (
    <main>
      <h2>Settings / Owners</h2>
      <OwnerList owners={namedOwners ?? []} chainId={safe?.chainId} isGranted={true} />
    </main>
  )
}

export default Owners
