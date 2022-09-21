import { TextField, InputAdornment, Grid, Button } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import type { ReactElement } from 'react'

import Track from '@/components/common/Track'
import { ADDRESS_BOOK_EVENTS } from '@/services/analytics/events/addressBook'
import PageHeader from '@/components/common/PageHeader'
import { AddressBookModalType } from '../AddressBookTable'
import { useAppSelector } from '@/store'
import { selectAllAddressBooks } from '@/store/addressBookSlice'

type Props = {
  searchQuery: string
  setSearchQuery: (searchQuery: string) => void
  handleOpenModal: (type: AddressBookModalType) => () => void
}

const AddressBookHeader = ({ searchQuery, setSearchQuery, handleOpenModal }: Props): ReactElement => {
  const allAddressBooks = useAppSelector(selectAllAddressBooks)
  const canExport = Object.values(allAddressBooks).length > 0

  return (
    <PageHeader
      title="Address book"
      subtitle="Save frequest contacts for easy transacting"
      action={
        <Grid container pb={2} px={3}>
          <Grid item xs={12} sm={9} md={6}>
            <TextField
              placeholder="Search"
              variant="filled"
              hiddenLabel
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                disableUnderline: true,
              }}
              fullWidth
            />
          </Grid>

          <Grid
            item
            sm={12}
            md={6}
            sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', gap: 2 }}
          >
            <Track {...ADDRESS_BOOK_EVENTS.IMPORT_BUTTON}>
              <Button onClick={handleOpenModal(AddressBookModalType.IMPORT)} variant="contained" size="small">
                Import
              </Button>
            </Track>

            <Track {...ADDRESS_BOOK_EVENTS.DOWNLOAD_BUTTON}>
              <Button
                onClick={handleOpenModal(AddressBookModalType.EXPORT)}
                disabled={!canExport}
                variant="contained"
                size="small"
              >
                Export
              </Button>
            </Track>

            <Track {...ADDRESS_BOOK_EVENTS.CREATE_ENTRY}>
              <Button onClick={handleOpenModal(AddressBookModalType.ENTRY)} variant="contained" size="small">
                Create entry
              </Button>
            </Track>
          </Grid>
        </Grid>
      }
    />
  )
}

export default AddressBookHeader
