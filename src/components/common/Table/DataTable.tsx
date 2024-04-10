import type { ReactElement } from 'react'
import { Box, Typography } from '@mui/material'
import type { DataRow } from '@/components/common/Table/DataRow'

type DataTableProps = {
  header: string
  rows: ReactElement<typeof DataRow>[]
}

export const DataTable = ({ header, rows }: DataTableProps): ReactElement | null => {
  return (
    <Box>
      <Typography variant="body1">
        <b>{header}</b>
      </Typography>
      {rows.map((row, index) => {
        return row
      })}
    </Box>
  )
}
