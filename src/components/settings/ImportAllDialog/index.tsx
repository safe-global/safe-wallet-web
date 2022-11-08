import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import Typography from '@mui/material/Typography'
import { type ReactElement, useState, useMemo } from 'react'

import ModalDialog from '@/components/common/ModalDialog'
import { useAppDispatch } from '@/store'

import ErrorMessage from '@/components/tx/ErrorMessage'
import { useDropzone } from 'react-dropzone'
import { migrateAddressBook } from '@/services/ls-migration/addressBook'
import { migrateAddedSafes } from '@/services/ls-migration/addedSafes'
import { addedSafesSlice } from '@/store/addedSafesSlice'
import { addressBookSlice } from '@/store/addressBookSlice'

import css from './styles.module.css'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import type { MouseEventHandler } from 'react'

const hasEntry = (entry: string[]) => {
  return entry.length === 3 && entry[0] && entry[1] && entry[2]
}

const ImportAllDialog = ({ handleClose }: { handleClose: () => void }): ReactElement => {
  const [jsonData, setJsonData] = useState<string>()
  const [fileName, setFileName] = useState<string>()
  const [error, setError] = useState<string>()

  // Count how many entries are in the CSV file
  const [migrationAddedSafes, migrationAddressbook] = useMemo(() => {
    if (!jsonData) {
      return [{}, {}]
    }
    const parsedFile = JSON.parse(jsonData)

    const abData = migrateAddressBook(parsedFile)
    const addedSafesData = migrateAddedSafes(parsedFile)

    return [addedSafesData, abData]
  }, [jsonData])

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

    if (migrationAddressbook) {
      dispatch(addressBookSlice.actions.setAddressBook(migrationAddressbook))
    }

    if (migrationAddedSafes) {
      dispatch(addedSafesSlice.actions.setAddedSafes(migrationAddedSafes))
    }

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

                  {migrationAddressbook && (
                    <Typography mt={1}>{`Found address book entries for ${
                      Object.keys(migrationAddressbook).length
                    } chains`}</Typography>
                  )}

                  {migrationAddedSafes && (
                    <Typography mt={1}>{`Found added safes for ${
                      Object.keys(migrationAddedSafes).length
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
