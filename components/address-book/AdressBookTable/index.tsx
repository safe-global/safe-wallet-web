import EnhancedTable from '@/components/common/EnhancedTable'
import useAddressBook from '@/hooks/useAddressBook'
import { useState } from 'react'
import CreateEntryDialog, { AddressEntry } from '@/components/address-book/CreateEntryDialog'
import ExportDialog from '@/components/address-book/ExportDialog'
import ImportDialog from '@/components/address-book/ImportDialog'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

import { useAppDispatch } from '@/store'
import { removeAddressBookEntry } from '@/store/addressBookSlice'
import useChainId from '@/hooks/useChainId'

const headCells = [
  { id: 'name', label: 'Name' },
  { id: 'address', label: 'Address' },
  { id: 'actions', label: '' },
]

const defaultOpen = { export: false, import: false, createEntry: false }

const AddressBookTable = () => {
  const dispatch = useAppDispatch()
  const chainId = useChainId()

  const [open, setOpen] = useState<typeof defaultOpen>(defaultOpen)
  const [entryDefaultValues, setEntryDefaultValues] = useState<AddressEntry | undefined>(undefined)

  const handleOpen = (type: keyof typeof open) => () => {
    setOpen((prev) => ({ ...prev, [type]: true }))
  }

  const handleClose = () => {
    setOpen(defaultOpen)
    setEntryDefaultValues(undefined)
  }

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
      content: (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Tooltip title="Edit entry">
            <IconButton
              onClick={() => {
                setEntryDefaultValues({ address, name })
                handleOpen('createEntry')
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete entry">
            <IconButton
              onClick={() => {
                dispatch(removeAddressBookEntry({ chainId, address }))
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
          {/*
          TODO: */}
          <Button disableElevation disabled>
            Send
          </Button>
        </div>
      ),
    },
  }))

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
      {open.createEntry && <CreateEntryDialog handleClose={handleClose} defaultValues={entryDefaultValues} />}
    </>
  )
}

export default AddressBookTable
