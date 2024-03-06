import CheckWallet from '@/components/common/CheckWallet'
import EnhancedTable from '@/components/common/EnhancedTable'
import EthHashInfo from '@/components/common/EthHashInfo'
import Track from '@/components/common/Track'
import { TxModalContext } from '@/components/tx-flow'
import { AddOwnerFlow, RemoveOwnerFlow, ReplaceOwnerFlow } from '@/components/tx-flow/flows'
import useAddressBook from '@/hooks/useAddressBook'
import useSafeInfo from '@/hooks/useSafeInfo'
import AddIcon from '@/public/images/common/add.svg'
import DeleteIcon from '@/public/images/common/delete.svg'
import ReplaceOwnerIcon from '@/public/images/settings/setup/replace-owner.svg'
import { SETTINGS_EVENTS } from '@/services/analytics/events/settings'
import type { AddressBook } from '@/store/addressBookSlice'
import { Box, Button, Grid, IconButton, SvgIcon, Tooltip, Typography } from '@mui/material'
import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { useContext, useMemo } from 'react'
import { jsonToCSV } from 'react-papaparse'
import { EditOwnerDialog } from '../EditOwnerDialog'

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
              <div data-sid="31518" className={tableCss.actions}>
                <CheckWallet>
                  {(isOk) => (
                    <Track {...SETTINGS_EVENTS.SETUP.REPLACE_OWNER}>
                      <Tooltip title={isOk ? 'Replace owner' : undefined}>
                        <span>
                          <IconButton
                            onClick={() => setTxFlow(<ReplaceOwnerFlow address={address} />)}
                            size="small"
                            disabled={!isOk}
                          >
                            <SvgIcon component={ReplaceOwnerIcon} inheritViewBox color="border" fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Track>
                  )}
                </CheckWallet>

                <EditOwnerDialog address={address} name={name} chainId={safe.chainId} />

                {showRemoveOwnerButton && (
                  <CheckWallet>
                    {(isOk) => (
                      <Track {...SETTINGS_EVENTS.SETUP.REMOVE_OWNER}>
                        <Tooltip title={isOk ? 'Remove owner' : undefined}>
                          <span>
                            <IconButton
                              onClick={() => setTxFlow(<RemoveOwnerFlow name={name} address={address} />)}
                              size="small"
                              disabled={!isOk}
                            >
                              <SvgIcon component={DeleteIcon} inheritViewBox color="error" fontSize="small" />
                            </IconButton>
                          </span>
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
    <Box data-sid="21025" display="flex" flexDirection="column" gap={2}>
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

          <Box data-sid="56065" pt={2} display="flex" justifyContent="space-between">
            <CheckWallet>
              {(isOk) => (
                <Track {...SETTINGS_EVENTS.SETUP.ADD_OWNER}>
                  <Button
                    data-sid="50712"
                    data-testid="add-owner-btn"
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

            <Button data-sid="79796" variant="text" onClick={() => exportOwners(safe, addressBook)}>
              Export as CSV
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}

function exportOwners({ chainId, address, owners }: SafeInfo, addressBook: AddressBook) {
  const json = owners.map((owner) => {
    const address = owner.value
    const name = addressBook[address] || owner.name
    return [address, name]
  })

  const csv = jsonToCSV(json)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')

  Object.assign(link, {
    download: `${chainId}-${address.value}-owners.csv`,
    href: window.URL.createObjectURL(blob),
  })

  link.click()
}
