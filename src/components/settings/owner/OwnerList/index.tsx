import EthHashInfo from '@/components/common/EthHashInfo'
import { AddOwnerDialog } from '@/components/settings/owner/AddOwnerDialog'
import useAddressBook from '@/hooks/useAddressBook'
import useSafeInfo from '@/hooks/useSafeInfo'
import { Box, Grid, Typography } from '@mui/material'
import { useMemo } from 'react'
import { EditOwnerDialog } from '../EditOwnerDialog'
import { RemoveOwnerDialog } from '../RemoveOwnerDialog'
import { ReplaceOwnerDialog } from '../ReplaceOwnerDialog'
import EnhancedTable from '@/components/common/EnhancedTable'

import tableCss from '@/components/common/EnhancedTable/styles.module.css'

const headCells = [
  { id: 'owner', label: 'Name' },
  { id: 'actions', label: '', sticky: true },
]

export const OwnerList = () => {
  const addressBook = useAddressBook()
  const { safe } = useSafeInfo()

  const rows = useMemo(() => {
    return safe.owners.map((owner) => {
      const address = owner.value
      const name = addressBook[address]

      return {
        cells: {
          owner: {
            rawValue: address,
            content: <EthHashInfo address={address} showCopyButton shortAddress={false} showName={true} hasExplorer />,
          },
          actions: {
            rawValue: '',
            sticky: true,
            content: (
              <div className={tableCss.actions}>
                <ReplaceOwnerDialog address={address} />
                <EditOwnerDialog address={address} name={name} chainId={safe.chainId} />
                <RemoveOwnerDialog owner={{ address, name }} />
              </div>
            ),
          },
        },
      }
    })
  }, [safe, addressBook])

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Grid container spacing={3}>
        <Grid item lg={4} xs={12}>
          <Typography variant="h4" fontWeight={700}>
            Manage Safe Account owners
          </Typography>
        </Grid>

        <Grid item xs>
          <Typography mb={2}>
            Add, remove and replace or rename existing owners. Owner names are only stored locally and will never be
            shared with us or any third parties.
          </Typography>

          <EnhancedTable rows={rows} headCells={headCells} />
          <AddOwnerDialog />
        </Grid>
      </Grid>
    </Box>
  )
}
