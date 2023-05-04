import { Button, Grid, SvgIcon, Card, CardHeader, CardContent, Box } from '@mui/material'
import { useState } from 'react'
import type { ReactElement } from 'react'

import { useAppSelector } from '@/store'
import { selectAllAddedSafes } from '@/store/addedSafesSlice'
import { selectAllAddressBooks } from '@/store/addressBookSlice'
import FileIcon from '@/public/images/settings/data/file.svg'
import ExportIcon from '@/public/images/common/export.svg'
import ImportIcon from '@/public/images/common/import.svg'
import { exportAppData } from '@/components/settings/DataManagement'
import { ImportDialog } from '@/components/settings/DataManagement/ImportDialog'
import { OVERVIEW_EVENTS } from '@/services/analytics'
import Track from '@/components/common/Track'

import css from './styles.module.css'

export const DataWidget = (): ReactElement => {
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [fileName, setFileName] = useState<string>()
  const [jsonData, setJsonData] = useState<string>()
  const addressBook = useAppSelector(selectAllAddressBooks)
  const addedSafes = useAppSelector(selectAllAddedSafes)
  const hasData = Object.keys(addressBook).length > 0 || Object.keys(addedSafes).length > 0

  const onImport = () => {
    setImportModalOpen(true)
  }

  const onClose = () => {
    setImportModalOpen(false)
  }

  return (
    <Card className={css.card}>
      <CardHeader
        avatar={
          <Box
            className={css.fileIcon}
            sx={{
              borderRadius: ({ shape }) => `${shape.borderRadius}px`,
            }}
          >
            <SvgIcon component={FileIcon} inheritViewBox fontSize="small" sx={{ fill: 'none' }} />
          </Box>
        }
        title={<b>{hasData ? 'Work with your data' : 'Already have a Safe Account?'}</b>}
        subheader={hasData ? 'Export or import your data' : 'Import your data'}
      />
      <CardContent>
        <Grid container spacing={2}>
          {hasData && (
            <Grid item xs={6}>
              <Track {...OVERVIEW_EVENTS.EXPORT_DATA}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={exportAppData}
                  startIcon={<SvgIcon component={ExportIcon} inheritViewBox fontSize="small" />}
                  sx={{ width: '100%' }}
                >
                  Export
                </Button>
              </Track>
            </Grid>
          )}
          <Grid item xs={6}>
            <Track {...OVERVIEW_EVENTS.IMPORT_DATA}>
              <Button
                variant="outlined"
                size="small"
                onClick={onImport}
                startIcon={<SvgIcon component={ImportIcon} inheritViewBox fontSize="small" />}
                sx={{ width: '100%' }}
              >
                Import
              </Button>
            </Track>
          </Grid>
        </Grid>
      </CardContent>
      {importModalOpen && (
        <ImportDialog
          fileName={fileName}
          setFileName={setFileName}
          jsonData={jsonData}
          setJsonData={setJsonData}
          onClose={onClose}
        />
      )}
    </Card>
  )
}
