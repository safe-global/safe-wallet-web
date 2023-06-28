import EthHashInfo from '@/components/common/EthHashInfo'
import AddOwnerFlow from '@/components/tx-flow/flows/AddOwner'
import useAddressBook from '@/hooks/useAddressBook'
import useSafeInfo from '@/hooks/useSafeInfo'
import { Box, Grid, Typography, Button, SvgIcon, Tooltip, IconButton } from '@mui/material'
import { useContext, useMemo } from 'react'
import { EditOwnerDialog } from '../EditOwnerDialog'
import ReplaceOwnerFlow from '@/components/tx-flow/flows/ReplaceOwner'
import RemoveOwnerFlow from '@/components/tx-flow/flows/RemoveOwner'
import EnhancedTable from '@/components/common/EnhancedTable'
import AddIcon from '@/public/images/common/add.svg'
import Track from '@/components/common/Track'
import { SETTINGS_EVENTS } from '@/services/analytics/events/settings'
import CheckWallet from '@/components/common/CheckWallet'
import { TxModalContext } from '@/components/tx-flow'
import ReplaceOwnerIcon from '@/public/images/settings/setup/replace-owner.svg'
import DeleteIcon from '@/public/images/common/delete.svg'

import tableCss from '@/components/common/EnhancedTable/styles.module.css'

const headCells = [
  { id: 'owner', label: 'Name' },
  { id: 'actions', label: '', sticky: true },
]

export const OwnerList = () => {
  const addressBook = useAddressBook()
  const { safe } = useSafeInfo()
  const { setTxFlow } = useContext(TxModalContext)

  const rows = useMemo(() => {
    const showRemoveOwnerButton = safe.owners.length > 1

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
                <CheckWallet>
                  {(isOk) => (
                    <Track {...SETTINGS_EVENTS.SETUP.REPLACE_OWNER}>
                      <Tooltip title="Replace owner">
                        <IconButton
                          onClick={() => setTxFlow(<ReplaceOwnerFlow address={address} />)}
                          size="small"
                          disabled={!isOk}
                        >
                          <SvgIcon component={ReplaceOwnerIcon} inheritViewBox color="border" fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Track>
                  )}
                </CheckWallet>

                <EditOwnerDialog address={address} name={name} chainId={safe.chainId} />

                {showRemoveOwnerButton && (
                  <CheckWallet>
                    {(isOk) => (
                      <Track {...SETTINGS_EVENTS.SETUP.REMOVE_OWNER}>
                        <Tooltip title="Remove owner">
                          <IconButton
                            onClick={() => setTxFlow(<RemoveOwnerFlow name={name} address={address} />)}
                            size="small"
                            disabled={!isOk}
                          >
                            <SvgIcon component={DeleteIcon} inheritViewBox color="error" fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Track>
                    )}
                  </CheckWallet>
                )}
              </div>
            ),
          },
        },
      }
    })
  }, [safe.owners, safe.chainId, addressBook, setTxFlow])

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

          <Box pt={2}>
            <CheckWallet>
              {(isOk) => (
                <Track {...SETTINGS_EVENTS.SETUP.ADD_OWNER}>
                  <Button
                    onClick={() => setTxFlow(<AddOwnerFlow />)}
                    variant="text"
                    startIcon={<SvgIcon component={AddIcon} inheritViewBox fontSize="small" />}
                    disabled={!isOk}
                  >
                    Add new owner
                  </Button>
                </Track>
              )}
            </CheckWallet>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}
