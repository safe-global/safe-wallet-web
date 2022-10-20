import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { useCSVReader, formatFileSize } from 'react-papaparse'
import type { ParseResult } from 'papaparse'
import { type ReactElement, useState, type MouseEvent, useMemo } from 'react'

import ModalDialog from '@/components/common/ModalDialog'
import { upsertAddressBookEntry } from '@/store/addressBookSlice'
import { useAppDispatch } from '@/store'
import { Box, Grid, IconButton } from '@mui/material'

import css from './styles.module.css'
import { trackEvent, ADDRESS_BOOK_EVENTS } from '@/services/analytics'
import { abCsvReaderValidator, abOnUploadValidator } from './validation'
import ErrorMessage from '@/components/tx/ErrorMessage'
import { Errors, logError } from '@/services/exceptions'

type AddressBookCSVRow = ['address', 'name', 'chainId']

// https://react-papaparse.js.org/docs#errors
type PapaparseErrorType = {
  type: string
  code: string
  message: string
  row: number
}

const hasEntry = (entry: string[]) => {
  return entry.length === 3 && entry[0] && entry[1] && entry[2]
}

const ImportDialog = ({ handleClose }: { handleClose: () => void }): ReactElement => {
  const [zoneHover, setZoneHover] = useState<boolean>(false)
  const [csvData, setCsvData] = useState<ParseResult<AddressBookCSVRow>>()
  const [error, setError] = useState<string>()

  // Count how many entries are in the CSV file
  const [entryCount, chainCount] = useMemo(() => {
    if (!csvData) return [0, 0]
    const entries = csvData.data.slice(1).filter(hasEntry)
    const entryLen = entries.length
    const chainLen = new Set(entries.map((entry) => entry[2].trim())).size
    return [entryLen, chainLen]
  }, [csvData])

  const dispatch = useAppDispatch()
  const { CSVReader } = useCSVReader()

  const handleImport = () => {
    if (!csvData) {
      return
    }

    const [, ...entries] = csvData.data

    for (const entry of entries) {
      const [address, name, chainId] = entry
      dispatch(upsertAddressBookEntry({ address, name, chainId: chainId.trim() }))
    }

    trackEvent({ ...ADDRESS_BOOK_EVENTS.IMPORT, label: entries.length })

    handleClose()
  }

  return (
    <ModalDialog open onClose={handleClose} dialogTitle="Import address book" hideChainIndicator>
      <DialogContent>
        <CSVReader
          accept="text/csv"
          multiple={false}
          onDragOver={() => {
            setZoneHover(true)
          }}
          onDragLeave={() => {
            setZoneHover(false)
          }}
          validator={abCsvReaderValidator}
          onUploadRejected={(result: { file: File; errors?: Array<Error | string | PapaparseErrorType> }[]) => {
            setZoneHover(false)
            setError(undefined)

            // csvReaderValidator error
            const error = result?.[0].errors?.pop()

            if (error) {
              const errorDescription = error instanceof Error ? error.message : JSON.stringify(error)
              setError(errorDescription)
              logError(Errors._703, errorDescription)
            }
          }}
          onUploadAccepted={(result: ParseResult<['address', 'name', 'chainId']>) => {
            setZoneHover(false)
            setError(undefined)

            // Remove empty rows
            const cleanResult = {
              ...result,
              data: result.data.filter(hasEntry),
            }

            const message = abOnUploadValidator(cleanResult)

            if (message) {
              setError(message)
            } else {
              setCsvData(cleanResult)
            }
          }}
        >
          {/* https://github.com/Bunlong/react-papaparse/blob/master/src/useCSVReader.tsx */}
          {({ getRootProps, acceptedFile, ProgressBar, getRemoveFileProps, Remove }: any) => {
            const { onClick, ...removeProps } = getRemoveFileProps()

            const onRemove = (e: MouseEvent<HTMLSpanElement>) => {
              setCsvData(undefined)
              setError(undefined)
              onClick(e)
            }

            return (
              <Box
                {...getRootProps()}
                className={css.dropbox}
                sx={{
                  border: ({ palette }) => `2px dashed ${zoneHover ? palette.primary.main : palette.border.light}`,
                }}
              >
                {acceptedFile ? (
                  <div>
                    <Grid container gap={1} alignItems="center">
                      <Grid item>
                        {acceptedFile.name} - {formatFileSize(acceptedFile.size)}
                      </Grid>

                      <Grid item>
                        <IconButton {...removeProps} onClick={onRemove}>
                          <Remove width={16} height={16} />
                        </IconButton>
                      </Grid>
                    </Grid>

                    <ProgressBar />

                    {entryCount > 0 && (
                      <Typography mt={1}>
                        {`Found ${entryCount} entries on ${chainCount} ${chainCount > 1 ? 'chains' : 'chain'}`}
                      </Typography>
                    )}
                  </div>
                ) : (
                  'Drop your CSV file here or click to upload.'
                )}
              </Box>
            )
          }}
        </CSVReader>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Typography>
          Only CSV files exported from a Safe can be imported.
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
        <Button onClick={handleImport} variant="contained" disableElevation disabled={!csvData || !!error}>
          Import
        </Button>
      </DialogActions>
    </ModalDialog>
  )
}

export default ImportDialog
