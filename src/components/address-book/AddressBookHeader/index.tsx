import { Box, Button, SvgIcon } from '@mui/material'
import type { ReactElement } from 'react'

import Track from '@/components/common/Track'
import { ADDRESS_BOOK_EVENTS } from '@/services/analytics/events/addressBook'
import PageHeader from '@/components/common/PageHeader'
import { ModalType } from '../AddressBookTable'
import { useAppSelector } from '@/store'
import { selectAllAddressBooks } from '@/store/addressBookSlice'
import ImportIcon from '@/public/images/address-book/import.svg'
import ExportIcon from '@/public/images/address-book/export.svg'
import AddCircleIcon from '@/public/images/common/add-outlined.svg'

type Props = {
  handleOpenModal: (type: ModalType) => () => void
}

const AddressBookHeader = ({ handleOpenModal }: Props): ReactElement => {
  const allAddressBooks = useAppSelector(selectAllAddressBooks)
  const canExport = Object.values(allAddressBooks).length > 0

  return (
    <PageHeader
      title="Address book"
      subtitle="Save frequent contacts for easy transacting"
      action={
        <Box display="flex" justifyContent="flex-end" pb={2}>
          <Track {...ADDRESS_BOOK_EVENTS.IMPORT_BUTTON}>
            <Button
              onClick={handleOpenModal(ModalType.IMPORT)}
              variant="text"
              color="primary"
              startIcon={<SvgIcon component={ImportIcon} inheritViewBox />}
            >
              Import
            </Button>
          </Track>

          <Track {...ADDRESS_BOOK_EVENTS.DOWNLOAD_BUTTON}>
            <Button
              onClick={handleOpenModal(ModalType.EXPORT)}
              disabled={!canExport}
              variant="text"
              color="primary"
              startIcon={<SvgIcon component={ExportIcon} inheritViewBox />}
            >
              Export
            </Button>
          </Track>

          <Track {...ADDRESS_BOOK_EVENTS.CREATE_ENTRY}>
            <Button
              onClick={handleOpenModal(ModalType.ENTRY)}
              variant="text"
              color="primary"
              startIcon={<SvgIcon component={AddCircleIcon} inheritViewBox />}
            >
              Create entry
            </Button>
          </Track>
        </Box>
      }
    />
  )
}

export default AddressBookHeader
