import { SafeBalanceResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { ReactElement } from 'react'
import FiatValue from '@/components/common/FiatValue'
import TokenAmount, { TokenIcon } from '@/components/common/TokenAmount'

interface AssetsTableProps {
  items?: SafeBalanceResponse['items']
}

const AssetsTable = ({ items }: AssetsTableProps): ReactElement => {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Asset</TableCell>
            <TableCell align="right">Balance</TableCell>
            <TableCell align="right">Value</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {items?.map((row) => (
            <TableRow key={row.tokenInfo.name}>
              <TableCell component="th" scope="row">
                <TokenIcon logoUri={row.tokenInfo.logoUri} tokenSymbol={row.tokenInfo.symbol} />

                {row.tokenInfo.name}
              </TableCell>

              <TableCell align="right">
                <TokenAmount value={row.balance} decimals={row.tokenInfo.decimals} tokenSymbol={row.tokenInfo.symbol} />
              </TableCell>

              <TableCell align="right">
                <FiatValue value={row.fiatBalance} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default AssetsTable
