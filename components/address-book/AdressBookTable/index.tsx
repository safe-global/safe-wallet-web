import EnhancedTable from '@/components/common/EnhancedTable'
import useAddressBook from '@/services/useAddressBook'

const headCells = [
  { id: 'name', label: 'Name' },
  { id: 'address', label: 'Address' },
  { id: 'actions', label: '' },
]

const AddressBookTable = () => {
  const addressBook = useAddressBook()
  const rows = Object.entries(addressBook).map(([address, name]) => ({
    name: {
      rawValue: name,
      content: name,
    },
    address: {
      rawValue: address,
      content: address,
    },
    actions: {
      rawValue: '',
      content: '',
    },
  }))

  return <EnhancedTable rows={rows} headCells={headCells} />
}

export default AddressBookTable
