import { AddressInfo } from '@/components/common/AddressInfo'
import { AddressEx } from '@gnosis.pm/safe-react-gateway-sdk'
import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { EditOwnerDialog } from '../EditOwnerDialog'
import { ReplaceOwnerDialog } from '../ReplaceOwnerDialog'
import css from './styles.module.css'

export const OwnerList = ({
  owners,
  chainId,
  isGranted,
}: {
  owners: { address: string; name: string }[]
  chainId?: string
  isGranted: boolean
}) => {
  const OwnerRow = (row: { name: string | null; address: string }) => {
    return (
      <TableRow key={row.address} className={css.row}>
        <TableCell component="td">{row.name ?? ''}</TableCell>
        <TableCell component="td">
          <AddressInfo address={row.address} copyToClipboard />
        </TableCell>
        <TableCell>
          <div className={css.actions}>
            {chainId && <EditOwnerDialog address={row.address} name={row.name} chainId={chainId} />}
            {chainId && isGranted && (
              <>
                <ReplaceOwnerDialog address={row.address} />
              </>
            )}
          </div>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <div className={css.container}>
      <h3>Manage Safe Owners</h3>
      <p>
        Add, remove and replace owners or rename existing owners. Owner names are only stored locally and never shared
        with Gnosis or any third parties.
      </p>
      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Address</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>{owners.map((owner) => OwnerRow(owner))}</TableBody>
        </Table>
      </TableContainer>
      <div>
        <Button variant="contained">Add New Owner</Button>
      </div>
    </div>
  )
}
