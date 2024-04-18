import type { ReactElement } from 'react'
import { Stack, Typography } from '@mui/material'
import type { DataRow } from '@/components/common/Table/DataRow'

type DataTableProps = {
  header: string
  rows: ReactElement<typeof DataRow>[]
}

export const DataTable = ({ header, rows }: DataTableProps): ReactElement | null => {
  return (
    <Stack gap="4px">
      <Typography variant="body1">
        <b>{header}</b>
      </Typography>
      {rows.map((row) => {
        return row
      })}
    </Stack>
  )
}
