import EnhancedTable from '@/components/common/EnhancedTable'
import useAddressBook from '@/hooks/useAddressBook'
import { useState } from 'react'
import EntryDialog, { AddressEntry } from '@/components/address-book/EntryDialog'
import ExportDialog from '@/components/address-book/ExportDialog'
import ImportDialog from '@/components/address-book/ImportDialog'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import RemoveDialog from '@/components/address-book/RemoveDialog'

import css from './styles.module.css'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'

const headCells = [
  { id: 'name', label: 'Name' },
  { id: 'address', label: 'Address' },
  { id: 'actions', label: '' },
]

enum ModalType {
  EXPORT = 'export',
  IMPORT = 'import',
  ENTRY = 'entry',
  REMOVE = 'remove',
}

const defaultOpen = {
  [ModalType.EXPORT]: false,
  [ModalType.IMPORT]: false,
  [ModalType.ENTRY]: false,
  [ModalType.REMOVE]: false,
}

const AddressBookTable = () => {
  const isSafeOwner = useIsSafeOwner()
  const [open, setOpen] = useState<typeof defaultOpen>(defaultOpen)
  const [defaultValues, setDefaultValues] = useState<AddressEntry | undefined>(undefined)

  const handleOpenModal = (type: keyof typeof open) => () => {
    setOpen((prev) => ({ ...prev, [type]: true }))
  }

  const handleOpenModalWithValues = (modal: ModalType, address: string, name: string) => {
    setDefaultValues({ address, name })
    handleOpenModal(modal)()
  }

  const handleClose = () => {
    setOpen(defaultOpen)
    setDefaultValues(undefined)
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
        <div className={css.entryButtonWrapper}>
          <Tooltip title="Edit entry">
            <IconButton onClick={() => handleOpenModalWithValues(ModalType.ENTRY, address, name)}>
              <EditIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete entry">
            <IconButton onClick={() => handleOpenModalWithValues(ModalType.REMOVE, address, name)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>

          {isSafeOwner && (
            <Button variant="contained" color="primary">
              Send
            </Button>
          )}
        </div>
      ),
    },
  }))

  return (
    <>
      <div className={css.headerButtonWrapper}>
        <Button
          onClick={handleOpenModal(ModalType.EXPORT)}
          disabled={addressBookEntries.length === 0}
          variant="contained"
          size="small"
          disableElevation
        >
          Export
        </Button>

        <Button onClick={handleOpenModal(ModalType.IMPORT)} variant="contained" size="small" disableElevation>
          Import
        </Button>

        <Button onClick={handleOpenModal(ModalType.ENTRY)} variant="contained" size="small" disableElevation>
          Create entry
        </Button>
      </div>

      <EnhancedTable rows={rows} headCells={headCells} />

      {open[ModalType.EXPORT] && <ExportDialog handleClose={handleClose} />}

      {open[ModalType.IMPORT] && <ImportDialog handleClose={handleClose} />}

      {open[ModalType.ENTRY] && <EntryDialog handleClose={handleClose} defaultValues={defaultValues} />}

      {open[ModalType.REMOVE] && <RemoveDialog handleClose={handleClose} address={defaultValues?.address || ''} />}
    </>
  )
}

export default AddressBookTable
