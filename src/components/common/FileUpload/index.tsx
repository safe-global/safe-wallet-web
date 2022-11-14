import css from './styles.module.css'
import { Box, Grid, IconButton, Link, SvgIcon, type SvgIconTypeMap, Typography } from '@mui/material'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import FileIcon from '@/public/images/settings/data/file.svg'
import type { MouseEventHandler, ReactElement } from 'react'

type FileInfo = {
  name: string
  additionalInfo?: string
  summary: ReactElement[]
  error?: string
}

const ColoredFileIcon = ({ color }: { color: SvgIconTypeMap['props']['color'] }) => (
  <SvgIcon component={FileIcon} inheritViewBox fontSize="small" color={color} sx={{ fill: 'none' }} />
)

const UploadSummary = ({ fileInfo, onRemove }: { fileInfo: FileInfo; onRemove: (() => void) | MouseEventHandler }) => {
  return (
    <Grid container direction="column" gap={1} mt={3}>
      <Grid container gap={1} display="flex" alignItems="center">
        <Grid item xs={1}>
          <ColoredFileIcon color="primary" />
        </Grid>
        <Grid item xs={7}>
          {fileInfo.name}
        </Grid>

        <Grid item xs display="flex" justifyContent="flex-end">
          <IconButton onClick={onRemove} size="small">
            <HighlightOffIcon color="primary" />
          </IconButton>
        </Grid>
      </Grid>
      <Grid item xs={12} display="flex" justifyContent="flex-start">
        <div className={css.verticalLine} />
      </Grid>
      <>
        {fileInfo.summary.map((summaryItem, idx) => (
          <Grid key={`${fileInfo.name}${idx}`} container display="flex" gap={1} alignItems="center">
            <Grid item xs={1}>
              <ColoredFileIcon color="border" />
            </Grid>
            <Grid item xs>
              <Typography>{summaryItem}</Typography>
            </Grid>
          </Grid>
        ))}
        {fileInfo.error && (
          <Grid container display="flex" gap={1} alignItems="center">
            <Grid item xs={1}>
              <ColoredFileIcon color="border" />
            </Grid>
            <Grid item xs>
              <Typography color="error">
                <strong>{fileInfo.error}</strong>
              </Typography>
            </Grid>
          </Grid>
        )}
      </>
    </Grid>
  )
}

const FileUpload = ({
  getRootProps,
  getInputProps,
  isDragReject = false,
  isDragActive = false,
  fileType,
  fileInfo,
  onRemove,
}: {
  isDragReject?: boolean
  isDragActive?: boolean
  fileType: string
  getInputProps?: () => any
  getRootProps: () => any
  fileInfo?: FileInfo
  onRemove: (() => void) | MouseEventHandler
}) => {
  if (fileInfo) {
    return <UploadSummary fileInfo={fileInfo} onRemove={onRemove} />
  }
  return (
    <Box
      {...getRootProps()}
      className={css.dropbox}
      sx={{
        cursor: isDragReject ? 'not-allowed' : undefined,
        background: ({ palette }) => `${isDragReject ? palette.error.light : undefined} !important`,
        border: ({ palette }) =>
          `1px dashed ${
            isDragReject ? palette.error.dark : isDragActive ? palette.primary.main : palette.secondary.dark
          }`,
      }}
    >
      {getInputProps && <input {...getInputProps()} />}

      <Box display="flex" alignItems="center" gap={1}>
        <SvgIcon
          component={FileIcon}
          inheritViewBox
          fontSize="small"
          sx={{ fill: 'none', color: ({ palette }) => palette.primary.light }}
        />
        <Typography>
          Drag and drop a {fileType} file or{' '}
          <Link href="#" color="secondary">
            choose a file
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}

export default FileUpload
