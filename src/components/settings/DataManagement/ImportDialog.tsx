import { Alert, AlertTitle, Box, Button, DialogActions, DialogContent, SvgIcon } from '@mui/material'
import type { Dispatch, ReactElement, SetStateAction } from 'react'

import ModalDialog from '@/components/common/ModalDialog'
import { FileListCard } from '@/components/settings/DataManagement/FileListCard'
import { ImportFileUpload } from '@/components/settings/DataManagement/ImportFileUpload'
import { useGlobalImportJsonParser } from '@/components/settings/DataManagement/useGlobalImportFileParser'
import FileIcon from '@/public/images/settings/data/file.svg'
import { OVERVIEW_EVENTS, OVERVIEW_LABELS, SETTINGS_EVENTS, trackEvent } from '@/services/analytics'
import { useAppDispatch } from '@/store'
import { addedSafesSlice } from '@/store/addedSafesSlice'
import { addressBookSlice } from '@/store/addressBookSlice'
import { showNotification } from '@/store/notificationsSlice'
import { safeAppsSlice } from '@/store/safeAppsSlice'
import { settingsSlice } from '@/store/settingsSlice'

import css from './styles.module.css'

export const ImportDialog = ({
  onClose,
  fileName = '',
  setFileName,
  jsonData = '',
  setJsonData,
}: {
  onClose?: () => void
  fileName: string | undefined
  setFileName: Dispatch<SetStateAction<string | undefined>>
  jsonData: string | undefined
  setJsonData: Dispatch<SetStateAction<string | undefined>>
}): ReactElement => {
  const dispatch = useAppDispatch()
  const { addedSafes, addedSafesCount, addressBook, addressBookEntriesCount, settings, safeApps, error } =
    useGlobalImportJsonParser(jsonData)

  const isDisabled = (!addedSafes && !addressBook && !settings && !safeApps) || !!error

  const handleClose = () => {
    setFileName(undefined)
    setJsonData(undefined)
    onClose?.()
  }

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
        ...OVERVIEW_EVENTS.IMPORT_DATA,
        label: OVERVIEW_LABELS.settings,
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

    dispatch(
      showNotification({
        variant: 'success',
        groupKey: 'global-import-success',
        message: 'Successfully imported data',
      }),
    )

    handleClose()
  }

  return (
    <ModalDialog open onClose={handleClose} dialogTitle="Data import" hideChainIndicator>
      <DialogContent>
        {!jsonData || !fileName ? (
          <Box data-sid="86821" mt={2}>
            <ImportFileUpload setFileName={setFileName} setJsonData={setJsonData} />
          </Box>
        ) : (
          <>
            <FileListCard
              avatar={
                <Box data-sid="98851" sx={{ borderRadius: ({ shape }) => `${shape.borderRadius}px` }}>
                  <SvgIcon
                    component={FileIcon}
                    inheritViewBox
                    fontSize="small"
                    sx={{ fill: 'none', display: 'block' }}
                  />
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
                This action will overwrite your currently added Safe Accounts, address book and settings with those from
                the imported file.
              </Alert>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button data-sid="74494" data-testid="dialog-cancel-btn" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          data-sid="41226"
          data-testid="dialog-import-btn"
          onClick={handleImport}
          variant="contained"
          disableElevation
          disabled={isDisabled}
        >
          Import
        </Button>
      </DialogActions>
    </ModalDialog>
  )
}
