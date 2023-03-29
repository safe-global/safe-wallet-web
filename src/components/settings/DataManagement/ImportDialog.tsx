import { DialogContent, Alert, AlertTitle, DialogActions, Button, Box, SvgIcon } from '@mui/material'
import classNames from 'classnames'
import type { ReactElement } from 'react'

import ModalDialog from '@/components/common/ModalDialog'
import { useAppDispatch } from '@/store'
import { trackEvent, SETTINGS_EVENTS } from '@/services/analytics'
import { addedSafesSlice } from '@/store/addedSafesSlice'
import { addressBookSlice } from '@/store/addressBookSlice'
import { safeAppsSlice } from '@/store/safeAppsSlice'
import { settingsSlice } from '@/store/settingsSlice'
import { FileListCard } from '@/components/settings/DataManagement/FileListCard'
import { useGlobalImportJsonParser } from '@/components/settings/DataManagement/useGlobalImportFileParser'
import FileIcon from '@/public/images/settings/data/file.svg'

import css from './styles.module.css'

export const ImportDialog = ({
  handleClose,
  fileName = '',
  jsonData = '',
}: {
  handleClose: () => void
  fileName: string | undefined
  jsonData: string | undefined
}): ReactElement => {
  const dispatch = useAppDispatch()
  const { addedSafes, addedSafesCount, addressBook, addressBookEntriesCount, settings, safeApps, error } =
    useGlobalImportJsonParser(jsonData)

  const isDisabled = (!addedSafes && !addressBook && !settings && !safeApps) || !!error

  const handleImport = () => {
    if (addressBook) {
      dispatch(addressBookSlice.actions.setAddressBook(addressBook))
      trackEvent({
        ...SETTINGS_EVENTS.DATA.IMPORT_ADDRESS_BOOK,
        label: addressBookEntriesCount,
      })
    }
    if (addedSafes) {
      dispatch(addedSafesSlice.actions.setAddedSafes(addedSafes))
      trackEvent({
        ...SETTINGS_EVENTS.DATA.IMPORT_ADDED_SAFES,
        label: addedSafesCount,
      })
    }

    if (settings) {
      dispatch(settingsSlice.actions.setSettings(settings))
      trackEvent(SETTINGS_EVENTS.DATA.IMPORT_SETTINGS)
    }

    if (safeApps) {
      dispatch(safeAppsSlice.actions.setSafeApps(safeApps))
      trackEvent(SETTINGS_EVENTS.DATA.IMPORT_SAFE_APPS)
    }
  }

  return (
    <ModalDialog
      open
      onClose={handleClose}
      dialogTitle="Data import"
      hideChainIndicator
      className={classNames(isDisabled && css.disabled)}
    >
      <DialogContent>
        <FileListCard
          avatar={
            <Box className={css.fileIcon} sx={{ borderRadius: ({ shape }) => `${shape.borderRadius}px` }}>
              <SvgIcon component={FileIcon} inheritViewBox fontSize="small" sx={{ fill: 'none' }} />
            </Box>
          }
          title={<b>{fileName}</b>}
          className={css.header}
          addedSafes={addedSafes}
          addressBook={addressBook}
          settings={settings}
          safeApps={safeApps}
          error={error}
          showPreview
        />
        {!isDisabled && (
          <Alert severity="warning">
            <AlertTitle sx={{ fontWeight: 700 }}>Overwrite your current data?</AlertTitle>
            This action will overwrite your currently added Safes, address book and settings with those from the
            imported file.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleImport} variant="contained" disableElevation disabled={isDisabled}>
          Import
        </Button>
      </DialogActions>
    </ModalDialog>
  )
}
