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
import { Alert, AlertTitle, Link, SvgIcon } from '@mui/material'
import FileIcon from '@/public/images/settings/data/file.svg'
import { SETTINGS_EVENTS, trackEvent } from '@/services/analytics'

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
    if (!addressBook && !addedSafes) {
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

    trackEvent({
      ...SETTINGS_EVENTS.DATA.IMPORT_ALL,
      label: `Added Safes: ${addedSafesCount}, Addressbook entries: ${addressBookEntriesCount}`,
    })

    handleClose()
  }

  return (
    <ModalDialog open onClose={handleClose} dialogTitle="Data Import" hideChainIndicator>
      <DialogContent>
        <div>
          {fileName ? (
            <Box>
              <>
                <Grid container direction="column" gap={1}>
                  <Grid container gap={1} display="flex" alignItems="center">
                    <Grid item xs={1}>
                      <SvgIcon
                        component={FileIcon}
                        inheritViewBox
                        fontSize="small"
                        color="primary"
                        sx={{ fill: 'none' }}
                      />
                    </Grid>
                    <Grid item xs={7}>
                      {fileName}
                    </Grid>

                    <Grid item xs display="flex" justifyContent="flex-end">
                      <IconButton onClick={onRemove}>
                        <HighlightOffIcon color="primary" width={16} height={16} />
                      </IconButton>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} display="flex" justifyContent="flex-start">
                    <div className={css.vertical_line} />
                  </Grid>
                  <>
                    {addressBook && (
                      <Grid container display="flex" gap={1} alignItems="center">
                        <Grid item xs={1}>
                          <SvgIcon
                            component={FileIcon}
                            inheritViewBox
                            fontSize="small"
                            color="border"
                            sx={{ fill: 'none' }}
                          />
                        </Grid>
                        <Grid item xs>
                          <Typography>
                            Found <strong>{addressBookEntriesCount} Address book</strong> entries for{' '}
                            <strong>{Object.keys(addressBook).length} chains</strong>
                          </Typography>
                        </Grid>
                      </Grid>
                    )}
                    {addedSafes && (
                      <Grid container display="flex" gap={1} alignItems="center">
                        <Grid item xs={1}>
                          <SvgIcon
                            component={FileIcon}
                            inheritViewBox
                            fontSize="small"
                            color="border"
                            sx={{ fill: 'none' }}
                          />
                        </Grid>
                        <Grid item xs>
                          <Typography>
                            Found <strong>{addedSafesCount} Added Safes</strong> entries for{' '}
                            <strong>{Object.keys(addedSafes).length} chains</strong>
                          </Typography>
                        </Grid>
                      </Grid>
                    )}
                    {!addedSafes && !addressBook && (
                      <Grid container display="flex" gap={1} alignItems="center">
                        <Grid item xs={1}>
                          <SvgIcon
                            component={FileIcon}
                            inheritViewBox
                            fontSize="small"
                            color="border"
                            sx={{ fill: 'none' }}
                          />
                        </Grid>
                        <Grid item xs>
                          <Typography color="error">
                            <strong>This file contains no importable data.</strong>
                          </Typography>
                        </Grid>
                      </Grid>
                    )}
                  </>
                </Grid>
              </>
            </Box>
          ) : (
            <Box
              {...getRootProps({ className: css.dropbox })}
              sx={{
                transition: 'border 0.5s',
                border: ({ palette }) =>
                  `1px dashed ${isDragActive || jsonData ? palette.primary.main : palette.secondary.dark}`,
              }}
            >
              <input {...getInputProps()} />

              <Box display="flex" alignItems="center" gap={1}>
                <SvgIcon
                  component={FileIcon}
                  inheritViewBox
                  fontSize="small"
                  sx={{ fill: 'none', color: ({ palette }) => palette.primary.light }}
                />
                <Typography>
                  Drag and drop a JSON file or{' '}
                  <Link href="#" color="secondary">
                    choose a file
                  </Link>
                </Typography>
              </Box>
            </Box>
          )}
        </div>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <div className={css.horizontal_divider} />

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
