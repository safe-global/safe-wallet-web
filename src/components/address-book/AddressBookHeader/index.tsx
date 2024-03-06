import SearchIcon from '@/public/images/common/search.svg'
import { Button, Grid, SvgIcon } from '@mui/material'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import type { ElementType, ReactElement } from 'react'

import PageHeader from '@/components/common/PageHeader'
import Track from '@/components/common/Track'
import AddCircleIcon from '@/public/images/common/add-outlined.svg'
import ExportIcon from '@/public/images/common/export.svg'
import ImportIcon from '@/public/images/common/import.svg'
import { ADDRESS_BOOK_EVENTS } from '@/services/analytics/events/addressBook'
import { useAppSelector } from '@/store'
import { selectAllAddressBooks, type AddressBookState } from '@/store/addressBookSlice'
import mapProps from '@/utils/mad-props'
import { ModalType } from '../AddressBookTable'

const HeaderButton = ({
  icon,
  onClick,
  disabled,
  children,
}: {
  icon: ElementType
  onClick: () => void
  disabled?: boolean
  children: string
}): ReactElement => {
  const svg = <SvgIcon component={icon} inheritViewBox fontSize="small" />

  return (
    <Button
      data-sid="15336"
      onClick={onClick}
      disabled={disabled}
      variant="text"
      color="primary"
      size="small"
      startIcon={svg}
    >
      {children}
    </Button>
  )
}

type Props = {
  allAddressBooks: AddressBookState
  handleOpenModal: (type: ModalType) => () => void
  searchQuery: string
  onSearchQueryChange: (searchQuery: string) => void
}

function AddressBookHeader({
  allAddressBooks,
  handleOpenModal,
  searchQuery,
  onSearchQueryChange,
}: Props): ReactElement {
  const canExport = Object.values(allAddressBooks).some((addressBook) => Object.keys(addressBook || {}).length > 0)

  return (
    <PageHeader
      title="Address book"
      noBorder
      action={
        <Grid container pb={1} spacing={1}>
          <Grid item xs={12} md={5} xl={4.5}>
            <TextField
              placeholder="Search"
              variant="filled"
              hiddenLabel
              value={searchQuery}
              onChange={(e) => {
                onSearchQueryChange(e.target.value)
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SvgIcon component={SearchIcon} inheritViewBox color="border" />
                  </InputAdornment>
                ),
                disableUnderline: true,
              }}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={7} display="flex" justifyContent={['space-between', , 'flex-end']} alignItems="center">
            <Track {...ADDRESS_BOOK_EVENTS.IMPORT_BUTTON}>
              <HeaderButton onClick={handleOpenModal(ModalType.IMPORT)} icon={ImportIcon}>
                Import
              </HeaderButton>
            </Track>

            <Track {...ADDRESS_BOOK_EVENTS.DOWNLOAD_BUTTON}>
              <HeaderButton onClick={handleOpenModal(ModalType.EXPORT)} icon={ExportIcon} disabled={!canExport}>
                Export
              </HeaderButton>
            </Track>

            <Track {...ADDRESS_BOOK_EVENTS.CREATE_ENTRY}>
              <HeaderButton onClick={handleOpenModal(ModalType.ENTRY)} icon={AddCircleIcon}>
                Create entry
              </HeaderButton>
            </Track>
          </Grid>
        </Grid>
      }
    />
  )
}

const useAllAddressBooks = () => useAppSelector(selectAllAddressBooks)

export default mapProps(AddressBookHeader, {
  allAddressBooks: useAllAddressBooks,
})
