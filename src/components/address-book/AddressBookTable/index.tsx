import EnhancedTable from '@/components/common/EnhancedTable'
import { useState } from 'react'
import EntryDialog, { AddressEntry } from '@/components/address-book/EntryDialog'
import ExportDialog from '@/components/address-book/ExportDialog'
import ImportDialog from '@/components/address-book/ImportDialog'
import EditIcon from '@mui/icons-material/Edit'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { Button, IconButton, Tooltip } from '@mui/material'
import RemoveDialog from '@/components/address-book/RemoveDialog'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import TokenTransferModal from '@/components/tx/modals/TokenTransferModal'
import css from './styles.module.css'
import EthHashInfo from '@/components/common/EthHashInfo'
import useAddressBook from '@/hooks/useAddressBook'
import Track from '@/components/common/Track'
import { ADDRESS_BOOK_EVENTS } from '@/services/analytics/events/addressBook'
import AddressBookHeader from '../AddressBookHeader'
import PagePlaceholder from '@/components/common/PagePlaceholder'
import { useDarkMode } from '@/hooks/useDarkMode'

const headCells = [
  { id: 'name', label: 'Name' },
  { id: 'address', label: 'Address' },
  { id: 'actions', label: '' },
]

export const enum AddressBookModalType {
  EXPORT = 'export',
  IMPORT = 'import',
  ENTRY = 'entry',
  REMOVE = 'remove',
}

const defaultOpen = {
  [AddressBookModalType.EXPORT]: false,
  [AddressBookModalType.IMPORT]: false,
  [AddressBookModalType.ENTRY]: false,
  [AddressBookModalType.REMOVE]: false,
}

const AddressBookTable = () => {
  const isDarkMode = useDarkMode()
  const isSafeOwner = useIsSafeOwner()
  const [searchQuery, setSearchQuery] = useState('')
  const [open, setOpen] = useState<typeof defaultOpen>(defaultOpen)
  const [defaultValues, setDefaultValues] = useState<AddressEntry | undefined>(undefined)
  const [selectedAddress, setSelectedAddress] = useState<string | undefined>()

  const handleOpenModal = (type: keyof typeof open) => () => {
    setOpen((prev) => ({ ...prev, [type]: true }))
  }

  const handleOpenModalWithValues = (modal: AddressBookModalType, address: string, name: string) => {
    setDefaultValues({ address, name })
    handleOpenModal(modal)()
  }

  const handleClose = () => {
    setOpen(defaultOpen)
    setDefaultValues(undefined)
  }

  const addressBook = useAddressBook()
  const addressBookEntries = Object.entries(addressBook)

  const rows = addressBookEntries
    .filter(([address, name]) => {
      const query = searchQuery.toLowerCase()
      return name.toLowerCase().includes(query) || address.toLowerCase().includes(query)
    })
    .map(([address, name]) => ({
      name: {
        rawValue: name,
        content: name,
      },
      address: {
        rawValue: address,
        content: <EthHashInfo address={address} showName={false} shortAddress={false} hasExplorer showCopyButton />,
      },
      actions: {
        rawValue: '',
        content: (
          <div className={css.entryButtonWrapper}>
            <Track {...ADDRESS_BOOK_EVENTS.EDIT_ENTRY}>
              <Tooltip title="Edit entry" placement="top">
                <IconButton
                  onClick={() => handleOpenModalWithValues(AddressBookModalType.ENTRY, address, name)}
                  size="small"
                >
                  <EditIcon color="border" />
                </IconButton>
              </Tooltip>
            </Track>

            <Track {...ADDRESS_BOOK_EVENTS.DELETE_ENTRY}>
              <Tooltip title="Delete entry" placement="top">
                <IconButton
                  onClick={() => handleOpenModalWithValues(AddressBookModalType.REMOVE, address, name)}
                  size="small"
                >
                  <DeleteOutlineIcon color="error" />
                </IconButton>
              </Tooltip>
            </Track>

            {isSafeOwner && (
              <Track {...ADDRESS_BOOK_EVENTS.SEND}>
                <Button variant="contained" color="primary" onClick={() => setSelectedAddress(address)}>
                  Send
                </Button>
              </Track>
            )}
          </div>
        ),
      },
    }))

  return (
    <>
      <AddressBookHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} handleOpenModal={handleOpenModal} />

      <main>
        {rows.length > 0 ? (
          <EnhancedTable rows={rows} headCells={headCells} />
        ) : (
          <PagePlaceholder
            imageUrl={isDarkMode ? '/images/address-book-dark.svg' : '/images/address-book-light.svg'}
            text="No entries found"
          />
        )}

        {open[AddressBookModalType.EXPORT] && <ExportDialog handleClose={handleClose} />}

        {open[AddressBookModalType.IMPORT] && <ImportDialog handleClose={handleClose} />}

        {open[AddressBookModalType.ENTRY] && <EntryDialog handleClose={handleClose} defaultValues={defaultValues} />}

        {open[AddressBookModalType.REMOVE] && (
          <RemoveDialog handleClose={handleClose} address={defaultValues?.address || ''} />
        )}

        {/* Send funds modal */}
        {selectedAddress && (
          <TokenTransferModal
            onClose={() => setSelectedAddress(undefined)}
            initialData={[{ recipient: selectedAddress }]}
          />
        )}
      </main>
    </>
  )
}

export default AddressBookTable
