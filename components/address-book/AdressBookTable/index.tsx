import useAddressBook from '@/services/useAddressBook'
import { DataGrid } from '@mui/x-data-grid'

const columns = [
  { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'id', headerName: 'Address', width: 400 },
  { field: 'actions', headerName: '', flex: 0.5 },
]

const AddressBookTable = () => {
  const addressBook = useAddressBook()
  const rows = Object.entries(addressBook).map(([id, name]) => ({ id, name }))

  return (
    <div style={{ height: 631, width: '100%' }}>
      <DataGrid columns={columns} rows={rows} pageSize={10} disableSelectionOnClick />
    </div>
  )
}

export default AddressBookTable
