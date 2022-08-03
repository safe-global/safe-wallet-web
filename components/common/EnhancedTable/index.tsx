import React, { ChangeEvent, ReactNode, useState } from 'react'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell, { SortDirection } from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TablePagination from '@mui/material/TablePagination'
import TableRow from '@mui/material/TableRow'
import TableSortLabel from '@mui/material/TableSortLabel'
import Paper from '@mui/material/Paper'
import { visuallyHidden } from '@mui/utils'
import { PaperTypeMap } from '@mui/material/Paper/Paper'

type EnhancedRow = Record<
  string,
  {
    content: ReactNode
    rawValue: string | number
  }
>

type EnhancedHeadCell = {
  id: string
  label: string
  width?: string
}

function descendingComparator(a: EnhancedRow, b: EnhancedRow, orderBy: string) {
  if (b[orderBy].rawValue < a[orderBy].rawValue) {
    return -1
  }
  if (b[orderBy].rawValue > a[orderBy].rawValue) {
    return 1
  }
  return 0
}

function getComparator(order: SortDirection, orderBy: string) {
  return order === 'desc'
    ? (a: any, b: any) => descendingComparator(a, b, orderBy)
    : (a: any, b: any) => -descendingComparator(a, b, orderBy)
}

type EnhancedTableHeadProps = {
  headCells: EnhancedHeadCell[]
  onRequestSort: (property: string) => void
  order: 'asc' | 'desc'
  orderBy: string
}

function EnhancedTableHead(props: EnhancedTableHeadProps) {
  const { headCells, order, orderBy, onRequestSort } = props
  const createSortHandler = (property: string) => () => {
    onRequestSort(property)
  }

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align="left"
            padding="normal"
            sortDirection={orderBy === headCell.id ? order : false}
            sx={headCell.width ? { width: headCell.width } : undefined}
          >
            {headCell.label && (
              <>
                <TableSortLabel
                  active={orderBy === headCell.id}
                  direction={orderBy === headCell.id ? order : 'asc'}
                  onClick={createSortHandler(headCell.id)}
                >
                  {headCell.label}
                  {orderBy === headCell.id ? (
                    <Box component="span" sx={visuallyHidden}>
                      {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                    </Box>
                  ) : null}
                </TableSortLabel>
              </>
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  )
}

type EnhancedTableProps = {
  rows: EnhancedRow[]
  headCells: EnhancedHeadCell[]
  variant?: PaperTypeMap['props']['variant']
}

const pageSizes = [10, 25, 100]

function EnhancedTable({ rows, headCells, variant }: EnhancedTableProps) {
  const [order, setOrder] = useState<'asc' | 'desc'>('asc')
  const [orderBy, setOrderBy] = useState<string>('')
  const [page, setPage] = useState<number>(0)
  const [rowsPerPage, setRowsPerPage] = useState<number>(pageSizes[1])

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const handleChangePage = (_: any, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0

  const orderedRows = orderBy ? rows.slice().sort(getComparator(order, orderBy)) : rows
  const pagedRows = orderedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }} variant={variant}>
        <TableContainer>
          <Table sx={{ minWidth: '650px' }} aria-labelledby="tableTitle">
            <EnhancedTableHead
              headCells={headCells}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {pagedRows.map((row, index) => (
                <TableRow tabIndex={-1} key={index}>
                  {Object.entries(row).map(([key, cell]) => (
                    <TableCell key={key}>{cell.content}</TableCell>
                  ))}
                </TableRow>
              ))}

              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 53 * emptyRows,
                  }}
                >
                  <TableCell colSpan={headCells.length} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {rows.length > pagedRows.length && (
          <TablePagination
            rowsPerPageOptions={pageSizes}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </Paper>
    </Box>
  )
}

export default EnhancedTable
