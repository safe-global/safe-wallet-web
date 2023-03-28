import { useState } from 'react'
import { Paper, Grid, Typography, Button, SvgIcon, Box } from '@mui/material'
import { useDropzone } from 'react-dropzone'

import FileIcon from '@/public/images/settings/data/file.svg'
import ExportIcon from '@/public/images/common/export.svg'
import { getPersistedState, useAppSelector } from '@/store'
import { addressBookSlice, selectAllAddressBooks } from '@/store/addressBookSlice'
import { addedSafesSlice, selectAllAddedSafes } from '@/store/addedSafesSlice'
import { safeAppsSlice, selectSafeApps } from '@/store/safeAppsSlice'
import { selectSettings, settingsSlice } from '@/store/settingsSlice'
import InfoIcon from '@/public/images/notifications/info.svg'
import ExternalLink from '@/components/common/ExternalLink'
import FileUpload, { FileTypes } from '@/components/common/FileUpload'
import { ImportDialog } from '@/components/settings/DataManagement/ImportDialog'
import { SAFE_EXPORT_VERSION } from '@/components/settings/DataManagement/useGlobalImportFileParser'
import { FileListCard } from '@/components/settings/DataManagement/FileListCard'

import css from './styles.module.css'

const AcceptedMimeTypes = {
  'application/json': ['.json'],
}

const getExportFileName = () => {
  const today = new Date().toISOString().slice(0, 10)
  return `safe-${today}.json`
}

const handleExport = () => {
  // Extract the slices we want to export
  const {
    [addressBookSlice.name]: addressBook,
    [addedSafesSlice.name]: addedSafes,
    [settingsSlice.name]: setting,
    [safeAppsSlice.name]: safeApps,
  } = getPersistedState()

  // Ensure they are under the same name as the slice
  const exportData = {
    [addressBookSlice.name]: addressBook,
    [addedSafesSlice.name]: addedSafes,
    [settingsSlice.name]: setting,
    [safeAppsSlice.name]: safeApps,
  }

  const data = JSON.stringify({ version: SAFE_EXPORT_VERSION.V2, data: exportData })

  const blob = new Blob([data], { type: 'text/json' })
  const link = document.createElement('a')

  link.download = getExportFileName()
  link.href = window.URL.createObjectURL(blob)
  link.dataset.downloadurl = ['text/json', link.download, link.href].join(':')
  link.dispatchEvent(new MouseEvent('click'))
}

const DataManagement = () => {
  const [jsonData, setJsonData] = useState<string>()
  const [fileName, setFileName] = useState<string>()

  const addedSafes = useAppSelector(selectAllAddedSafes)
  const addressBook = useAppSelector(selectAllAddressBooks)
  const settings = useAppSelector(selectSettings)
  const safeApps = useAppSelector(selectSafeApps)

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
      setFileName(file.name)
      setJsonData(event.target.result)
    }
    reader.readAsText(file)
  }

  const onClose = () => {
    setFileName(undefined)
    setJsonData(undefined)
  }

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    maxFiles: 1,
    onDrop,
    accept: AcceptedMimeTypes,
  })

  const infoIcon = (
    <SvgIcon
      component={InfoIcon}
      inheritViewBox
      fontSize="small"
      color="border"
      sx={{
        verticalAlign: 'middle',
      }}
    />
  )

  return (
    <Paper sx={{ p: 4, mb: 2 }}>
      <Grid container spacing={3}>
        <Grid item sm={4} xs={12}>
          <Typography variant="h4" fontWeight={700}>
            Data export
          </Typography>
        </Grid>

        <Grid item container xs>
          <Typography>Download your local data with your added Safes, address book and settings.</Typography>

          <FileListCard
            avatar={
              <Box className={css.fileIcon} sx={{ borderRadius: ({ shape }) => `${shape.borderRadius}px` }}>
                <SvgIcon component={FileIcon} inheritViewBox fontSize="small" sx={{ fill: 'none' }} />
              </Box>
            }
            title={<b>{getExportFileName()}</b>}
            action={
              <Button variant="contained" className={css.exportIcon} onClick={handleExport}>
                <SvgIcon component={ExportIcon} inheritViewBox fontSize="small" />
              </Button>
            }
            addedSafes={addedSafes}
            addressBook={addressBook}
            settings={settings}
            safeApps={safeApps}
          />
          <Typography className={css.hint}>
            {infoIcon}
            You can also export your data from the{' '}
            <ExternalLink href="https://gnosis-safe.io/app/export">old app</ExternalLink>
          </Typography>
        </Grid>
      </Grid>

      <Grid container spacing={3} mt={2}>
        <Grid item sm={4} xs={12}>
          <Typography variant="h4" fontWeight={700}>
            Data import
          </Typography>
        </Grid>

        <Grid item xs>
          <Typography>Import Safe data by clicking or dragging a file below.</Typography>

          <FileUpload
            fileType={FileTypes.JSON}
            getRootProps={() => ({ ...getRootProps(), height: '228px' })}
            getInputProps={getInputProps}
            isDragActive={isDragActive}
            isDragReject={isDragReject}
            onRemove={onClose}
          />

          <Typography className={css.hint}>
            {infoIcon}
            Only JSON files exported from a Safe can be imported.
          </Typography>

          {jsonData && <ImportDialog handleClose={onClose} jsonData={jsonData} fileName={fileName} />}
        </Grid>
      </Grid>
    </Paper>
  )
}

export default DataManagement
