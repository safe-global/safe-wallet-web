import { type EnhancedRow } from '@/components/common/EnhancedTable'
import PrefixedEthHashInfo from '@/components/common/EthHashInfo'
import { Card, TableCell, Typography } from '@mui/material'
import React from 'react'
import css from './styles.module.css'

type TableCardProps = {
  row: EnhancedRow
  className?: string
}

const TableCard = ({ row, className }: TableCardProps) => {
  return (
    <TableCell colSpan={3} className={className}>
      <Card className={css.tableCard}>
        <Typography variant="body2">{row.cells.name.content}</Typography>
        <PrefixedEthHashInfo
          address={row.cells.address.rawValue.toString()}
          showName={false}
          shortAddress={false}
          hasExplorer
          showCopyButton
        />
        {row.cells.actions.content}
      </Card>
    </TableCell>
  )
}

export default TableCard
