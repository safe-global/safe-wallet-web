import EthHashInfo from '@/components/common/EthHashInfo'
import { AddOwnerDialog } from '@/components/settings/owner/AddOwnerDialog'
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
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
      <TableRow className={css.row}>
        <TableCell component="td">{row.name ?? ''}</TableCell>
        <TableCell component="td">
          <EthHashInfo address={row.address} showCopyButton shortAddress={false} />
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
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography variant="h4" fontWeight={700}>
        Manage Safe Owners
      </Typography>
      <Typography>
        Add, remove and replace or rename existing owners. Owner names are only stored locally and never shared with
        Gnosis or any third parties.
      </Typography>
      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Address</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {owners.map((owner) => (
              <OwnerRow {...owner} key={owner.address} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {isGranted && <AddOwnerDialog />}
    </Box>
  )
}
