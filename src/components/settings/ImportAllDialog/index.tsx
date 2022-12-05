import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { type ReactElement, useState } from 'react'

import ModalDialog from '@/components/common/ModalDialog'
import { useAppDispatch } from '@/store'

import { useDropzone } from 'react-dropzone'
import { addedSafesSlice } from '@/store/addedSafesSlice'
import { addressBookSlice } from '@/store/addressBookSlice'

import css from './styles.module.css'
import type { MouseEventHandler } from 'react'
import { useGlobalImportJsonParser } from './useGlobalImportFileParser'
import { showNotification } from '@/store/notificationsSlice'
import { Alert, AlertTitle } from '@mui/material'
import { SETTINGS_EVENTS, trackEvent } from '@/services/analytics'
import FileUpload, { FileTypes, type FileInfo } from '@/components/common/FileUpload'

const AcceptedMimeTypes = {
  'application/json': ['.json'],
}

const ImportAllDialog = ({ handleClose }: { handleClose: () => void }): ReactElement => {
  const [jsonData, setJsonData] = useState<string>()
  const [fileName, setFileName] = useState<string>()

  // Parse the jsonData whenever it changes
  const { addedSafes, addedSafesCount, addressBook, addressBookEntriesCount, error } =
    useGlobalImportJsonParser(jsonData)

  const dispatch = useAppDispatch()

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      return
    }
    const file = acceptedFiles[0]
    const reader = new FileReader()
    reader.onload = (event) => {
      if (!event.target) {
        return
      }
      if (typeof event.target.result !== 'string') {
        return
      }
      setJsonData(event.target.result)
      setFileName(file.name)
    }
    reader.readAsText(file)
  }

  const onRemove: MouseEventHandler = (event) => {
    setJsonData(undefined)
    setFileName(undefined)
    event.preventDefault()
    event.stopPropagation()
  }

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    maxFiles: 1,
    onDrop,
    accept: AcceptedMimeTypes,
  })

  const handleImport = () => {
    if (!addressBook && !addedSafes) {
      return
    }

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

    dispatch(
      showNotification({
        variant: 'success',
        groupKey: 'global-import-success',
        message: 'Successfully imported data',
        detailedMessage: [
          ...(addedSafesCount > 0 ? [`${addedSafesCount} Safes were added.`] : []),
          ...(addressBookEntriesCount > 0
            ? [`${addressBookEntriesCount} addresses were added to your address book.`]
            : []),
        ].join('\n'),
      }),
    )

    handleClose()
  }

  const fileInfo: FileInfo | undefined = fileName
    ? {
        name: fileName,
        error,
        summary: [
          ...(addedSafesCount > 0 && addedSafes
            ? [
                <Typography key="addedSafesInfo">
                  Found <strong>{addedSafesCount} Added Safes</strong> entries on{' '}
                  <strong>{Object.keys(addedSafes).length} chain(s)</strong>
                </Typography>,
              ]
            : []),
          ...(addressBookEntriesCount > 0 && addressBook
            ? [
                <Typography key="addressBookInfo">
                  Found <strong>{addressBookEntriesCount} Address book</strong> entries on{' '}
                  <strong>{Object.keys(addressBook).length} chain(s)</strong>
                </Typography>,
              ]
            : []),
        ],
      }
    : undefined

  return (
    <ModalDialog open onClose={handleClose} dialogTitle="Data import" hideChainIndicator>
      <DialogContent>
        <FileUpload
          fileType={FileTypes.JSON}
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          isDragActive={isDragActive}
          isDragReject={isDragReject}
          fileInfo={fileInfo}
          onRemove={onRemove}
        />

        <div className={css.horizontalDivider} />

        <Typography>Only JSON files exported from a Safe can be imported.</Typography>
        <Alert severity="warning" sx={{ mt: 3 }}>
          <AlertTitle sx={{ fontWeight: 700 }}>Overwrite your current data?</AlertTitle>
          This action will overwrite your currently added Safes and address book entries with those from the imported
          file.
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleImport}
          variant="contained"
          disableElevation
          disabled={(!addressBook && !addedSafes) || !!error}
        >
          Import
        </Button>
      </DialogActions>
    </ModalDialog>
  )
}

export default ImportAllDialog
