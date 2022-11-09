import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import Typography from '@mui/material/Typography'
import { type ReactElement, useState } from 'react'

import ModalDialog from '@/components/common/ModalDialog'
import { useAppDispatch } from '@/store'

import ErrorMessage from '@/components/tx/ErrorMessage'
import { useDropzone } from 'react-dropzone'
import { addedSafesSlice } from '@/store/addedSafesSlice'
import { addressBookSlice } from '@/store/addressBookSlice'

import css from './styles.module.css'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import type { MouseEventHandler } from 'react'
import { useGlobalImportJsonParser } from './useGlobalImportFileParser'
import { showNotification } from '@/store/notificationsSlice'

const ImportAllDialog = ({ handleClose }: { handleClose: () => void }): ReactElement => {
  const [jsonData, setJsonData] = useState<string>()
  const [fileName, setFileName] = useState<string>()
  const [error, setError] = useState<string>()

  // Parse the jsonData whenever it changes
  const { addedSafes, addedSafesCount, addressBook, addressBookEntriesCount } = useGlobalImportJsonParser(jsonData)

  const dispatch = useAppDispatch()

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      return
    }
    const file = acceptedFiles[0]
    const reader = new FileReader()
    reader.onload = function (evt) {
      if (!evt.target) {
        return
      }
      if (typeof evt.target.result !== 'string') {
        return
      }
      setJsonData(evt.target.result)
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

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    maxFiles: 1,
    onDrop,
    accept: {
      text: ['.json'],
    },
  })

  const handleImport = () => {
    if (!jsonData) {
      return
    }

    if (addressBook) {
      dispatch(addressBookSlice.actions.setAddressBook(addressBook))
    }

    if (addedSafes) {
      dispatch(addedSafesSlice.actions.setAddedSafes(addedSafes))
    }

    dispatch(
      showNotification({
        variant: 'success',
        groupKey: 'global-import-success',
        message: 'Successfully imported data',
        detailedMessage: `${addedSafesCount > 0 ? `${addedSafesCount} Safes were added. \n` : ''}${
          addressBookEntriesCount > 0 ? `${addressBookEntriesCount} addresses were added to your address book.` : ''
        }`,
      }),
    )

    handleClose()
  }

  return (
    <ModalDialog open onClose={handleClose} dialogTitle="Import added Safes and address book" hideChainIndicator>
      <DialogContent>
        <div>
          <Box
            {...getRootProps({ className: css.dropbox })}
            sx={{
              border: ({ palette }) => `2px dashed ${isDragActive ? palette.primary.main : palette.border.light}`,
            }}
          >
            <input {...getInputProps()} />
            {fileName ? (
              <Box>
                <>
                  <Grid container gap={1} alignItems="center">
                    <Grid item>{fileName}</Grid>

                    <Grid item>
                      <IconButton onClick={onRemove}>
                        <HighlightOffIcon width={16} height={16} />
                      </IconButton>
                    </Grid>
                  </Grid>

                  {addressBook && (
                    <Typography mt={1}>{`Found ${addressBookEntriesCount} address book entries on ${
                      Object.keys(addressBook).length
                    } chains`}</Typography>
                  )}

                  {addedSafes && (
                    <Typography mt={1}>{`Found ${addedSafesCount} added safes on ${
                      Object.keys(addedSafes).length
                    } chains`}</Typography>
                  )}
                </>
              </Box>
            ) : (
              'Drop your JSON file here or click to upload.'
            )}
          </Box>
        </div>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Typography>Only JSON files exported from a Safe can be imported.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleImport} variant="contained" disableElevation disabled={!jsonData || !!error}>
          Import
        </Button>
      </DialogActions>
    </ModalDialog>
  )
}

export default ImportAllDialog
