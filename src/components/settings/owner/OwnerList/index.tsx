import EthHashInfo from '@/components/common/EthHashInfo'
import { AddOwnerDialog } from '@/components/settings/owner/AddOwnerDialog'
import useAddressBook from '@/hooks/useAddressBook'
import useSafeInfo from '@/hooks/useSafeInfo'
import { Box, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { ReactElement } from 'react'
import { EditOwnerDialog } from '../EditOwnerDialog'
import { RemoveOwnerDialog } from '../RemoveOwnerDialog'
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
    <TableRow>
      <TableCell>
        <EthHashInfo address={address} showCopyButton shortAddress={false} showName={true} hasExplorer />
      </TableCell>

      <TableCell className="sticky">
        <div className={css.actions}>
          {isGranted && <ReplaceOwnerDialog address={address} />}
          <EditOwnerDialog address={address} name={name} chainId={chainId} />
          {isGranted && <RemoveOwnerDialog owner={{ address, name }} />}
        </div>
      </TableCell>
    </TableRow>
  )
}

export const OwnerList = ({ isGranted }: { isGranted: boolean }) => {
  const addressBook = useAddressBook()
  const { safe } = useSafeInfo()
  const { chainId } = safe
  const owners = safe.owners.map((item) => item.value)

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Grid container spacing={3}>
        <Grid item lg={4} xs={12}>
          <Typography variant="h4" fontWeight={700}>
            Manage Safe owners
          </Typography>
        </Grid>

        <Grid item xs>
          <Typography mb={2}>
            Add, remove and replace or rename existing owners. Owner names are only stored locally and will never be
            shared with us or any third parties.
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell colSpan={2}>Name</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {owners.map((owner) => (
                  <OwnerRow
                    key={owner}
                    address={owner}
                    name={addressBook[owner]}
                    chainId={chainId}
                    isGranted={isGranted}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {isGranted && <AddOwnerDialog />}
        </Grid>
      </Grid>
    </Box>
  )
}
