import EnhancedTable from '@/components/common/EnhancedTable'
import useAddressBook from '@/hooks/useAddressBook'
import { useState } from 'react'
import CreateEntryDialog from '@/components/address-book/CreateEntryDialog'
import ExportDialog from '@/components/address-book/ExportDialog'
import ImportDialog from '@/components/address-book/ImportDialog'

const headCells = [
  { id: 'name', label: 'Name' },
  { id: 'address', label: 'Address' },
  { id: 'actions', label: '' },
]

const defaultOpen = { export: false, import: false, createEntry: false }

const AddressBookTable = () => {
  const addressBook = useAddressBook()
  const addressBookEntries = Object.entries(addressBook)
  const rows = addressBookEntries.map(([address, name]) => ({
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

  const [open, setOpen] = useState<typeof defaultOpen>(defaultOpen)

  const handleOpen = (type: keyof typeof open) => () => {
    setOpen((prev) => ({ ...prev, [type]: true }))
  }

  const handleClose = () => {
    setOpen(defaultOpen)
  }

  return (
    <>
      <button onClick={handleOpen('export')} disabled={addressBookEntries.length === 0}>
        Export
      </button>
      <button onClick={handleOpen('import')}>Import</button>
      <button onClick={handleOpen('createEntry')}>Create entry</button>
      <EnhancedTable rows={rows} headCells={headCells} />
      {open.export && <ExportDialog handleClose={handleClose} />}
      {open.import && <ImportDialog handleClose={handleClose} />}
      {open.createEntry && <CreateEntryDialog handleClose={handleClose} />}
    </>
  )
}

export default AddressBookTable
