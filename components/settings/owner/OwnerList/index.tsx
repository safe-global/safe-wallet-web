import EthHashInfo from '@/components/common/EthHashInfo'
import { AddOwnerDialog } from '@/components/settings/owner/AddOwnerDialog'
import useAddressBook from '@/hooks/useAddressBook'
import useChainId from '@/hooks/useChainId'
import useSafeInfo from '@/hooks/useSafeInfo'
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { ReactElement } from 'react'
import { EditOwnerDialog } from '../EditOwnerDialog'
import { ReplaceOwnerDialog } from '../ReplaceOwnerDialog'
import css from './styles.module.css'

const OwnerRow = ({
  name,
  address,
  chainId,
  isGranted,
}: {
  name?: string
  address: string
  chainId: string
  isGranted: boolean
}): ReactElement => {
  return (
    <TableRow className={css.row}>
      <TableCell>{name ?? ''}</TableCell>

      <TableCell>
        <EthHashInfo address={address} showCopyButton shortAddress={false} showName={false} />
      </TableCell>

      <TableCell>
        {isGranted && (
          <div className={css.actions}>
            <EditOwnerDialog address={address} name={name} chainId={chainId} />
            <ReplaceOwnerDialog address={address} />
          </div>
        )}
      </TableCell>
    </TableRow>
  )
}

export const OwnerList = ({ isGranted }: { isGranted: boolean }) => {
  const chainId = useChainId()
  const addressBook = useAddressBook()
  const { data: safe } = useSafeInfo()
  const owners = (safe?.owners ?? []).map((item) => item.value)

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography variant="h4" fontWeight={700}>
        Manage Safe owners
      </Typography>

      <Typography>
        Add, remove and replace or rename existing owners. Owner names are only stored locally and never shared with
        Gnosis or any third parties.
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Address</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {owners.map((owner) => (
              <OwnerRow key={owner} address={owner} name={addressBook[owner]} chainId={chainId} isGranted={isGranted} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {isGranted && <AddOwnerDialog />}
    </Box>
  )
}
