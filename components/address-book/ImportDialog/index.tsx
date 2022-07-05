import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { useCSVReader, formatFileSize } from 'react-papaparse'
import { ParseResult } from 'papaparse'
import { type ReactElement, useState, type MouseEvent } from 'react'

import ModalDialog from '@/components/common/ModalDialog'
import { upsertAddressBookEntry } from '@/store/addressBookSlice'
import { useAppDispatch } from '@/store'
import { Box } from '@mui/material'
import { showNotification } from '@/store/notificationsSlice'

import css from './styles.module.css'

const ImportDialog = ({ handleClose }: { handleClose: () => void }): ReactElement => {
  const [zoneHover, setZoneHover] = useState<boolean>(false)
  const [csvData, setCsvData] = useState<ParseResult<['address', 'name', 'chainId']>>()

  const dispatch = useAppDispatch()
  const { CSVReader } = useCSVReader()

  const handleImport = () => {
    if (!csvData) {
      return
    }

    if (csvData.errors.length > 0) {
      const { message } = csvData.errors[0]
      dispatch(showNotification({ message, variant: 'error', groupKey: '' }))
      return
    }

    if (csvData.data.length === 0) {
      return
    }

    const [header, ...entries] = csvData.data

    const hasValidHeaders =
      header.length === 3 && header[0] === 'address' && header[1] === 'name' && header[2] === 'chainId'

    if (!hasValidHeaders) {
      dispatch(showNotification({ message: 'Invalid or corrupt address book', variant: 'error', groupKey: '' }))
      return
    }

    for (const [address, name, chainId] of entries) {
      dispatch(upsertAddressBookEntry({ address, name, chainId }))
    }

    handleClose()
  }

  return (
    <ModalDialog open onClose={handleClose} title="Import address book">
      <DialogContent>
        <CSVReader
          onUploadAccepted={(result: ParseResult<['address', 'name', 'chainId']>) => {
            setCsvData(result)
            setZoneHover(false)
          }}
          onDragOver={() => {
            setZoneHover(true)
          }}
          onDragLeave={() => {
            setZoneHover(false)
          }}
        >
          {/* https://github.com/Bunlong/react-papaparse/blob/master/src/useCSVReader.tsx */}
          {({ getRootProps, acceptedFile, ProgressBar, getRemoveFileProps, Remove }: any) => {
            const { onClick, ...removeProps } = getRemoveFileProps()

            const onRemove = (e: MouseEvent<HTMLSpanElement>) => {
              onClick(e)
              setCsvData(undefined)
            }

            return (
              <Box
                {...getRootProps()}
                className={css.dropbox}
                sx={{
                  border: ({ palette }) => `2px dashed ${zoneHover ? palette.error.main : palette.primaryGray[400]}`,
                  py: '12px',
                  my: '24px',
                }}
              >
                {acceptedFile ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {acceptedFile.name} - {formatFileSize(acceptedFile.size)}
                      <span {...removeProps} onClick={onRemove}>
                        <Remove width={16} height={16} />
                      </span>
                    </div>
                    <ProgressBar />
                  </div>
                ) : (
                  'Drop your CSV file here or click to upload.'
                )}
              </Box>
            )
          }}
        </CSVReader>
        <Typography>
          Only CSV files exported from a Gnosis Safe can be imported.
          <br />
          <Link
            href="https://help.gnosis-safe.io/en/articles/5299068-address-book-export-and-import"
            target="_blank"
            rel="noreferrer"
            title="Learn about the address book import and export"
          >
            Learn about the address book import and export
          </Link>
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleImport}
          variant="contained"
          disableElevation
          disabled={!csvData || csvData.data.length === 0}
        >
          Import
        </Button>
      </DialogActions>
    </ModalDialog>
  )
}

export default ImportDialog
