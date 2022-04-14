import { SafeBalanceResponse } from '@gnosis.pm/safe-react-gateway-sdk'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core'
import { ReactElement } from 'react'
import { BigNumber } from 'bignumber.js'

export const humanReadableValue = (value: string, decimals = 18): string => {
  return new BigNumber(value).times(`1e-${decimals}`).toFixed()
}

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
                {row.tokenInfo.name}
              </TableCell>
              <TableCell align="right">
                {humanReadableValue(row.balance, row.tokenInfo.decimals)} {row.tokenInfo.symbol}
              </TableCell>
              <TableCell align="right">{row.fiatBalance}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default AssetsTable
